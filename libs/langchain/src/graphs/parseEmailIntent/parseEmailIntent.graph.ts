import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMClient } from '../../clients';
import {
  classifyMessageAsRFQOutputSchemaTxt,
  extractRFQDetailsOutputSchemaTxt,
  summarizeEmailOutputSchemaTxt,
  TSummarizeMessageInput,
} from '@prompts';
import { SummarizeMessagesNode } from '../../nodes/summarizeMessages/summarizeMessages.node';
import { StateGraph, START, END } from '@langchain/langgraph';
import { ClassifyMessageAsRFQNode } from '../../nodes/classifyMessageAsRFQ/classifyMessageAsRFQ.node';
import { ExtractRFQDetailsNode } from '../../nodes/extractRFQDetails/extractRFQDetails.node';
import { nextOrErrorNode } from '../../util';
import { HandleErrorNode } from '../../nodes/handleError/handleError.node';
import { z } from 'zod';
import {
  EmailIntentSchema,
  TEmailIntentSchemaType,
} from './parseEmailIntent.schema';
import { AIClientTypes } from '@common';
import { TConfiguration } from '@app-config/config';
import { DateTime } from 'luxon';

@Injectable()
export class ParseEmailIntentGraph {
  // private readonly graph: StateGraph<TParseEmailIntentState>;
  logger = new Logger(ParseEmailIntentGraph.name);

  constructor(
    private configService: ConfigService,
    private summarizeMessageNode: SummarizeMessagesNode,
    private classifyEmailAsRFQNode: ClassifyMessageAsRFQNode,
    private extractRFQDataNode: ExtractRFQDetailsNode,
    private handleErrorNode: HandleErrorNode,
    private llmClient: LLMClient<TSummarizeMessageInput>,
  ) {
    // Read AI strategy from configuration
    const aiStrategy = this.configService.getOrThrow<AIClientTypes>('aiStrategy');
    this.llmClient.setStrategy(aiStrategy);
    this.logger.log(`Initialized with AI strategy: ${aiStrategy}`);
  }

  async parseEmailWithLLM(
    threadId: string,
    sender: string,
    messages: string[],
  ): Promise<TEmailIntentSchemaType> {
    const { graph, initialState } = this.buildGraph(threadId, sender, messages);

    // calling invoke internally calls validateState, so make sure initState also passes schema validation
    const response = await graph.invoke(initialState);

    if (!response) {
      throw new Error('Failed to parse email');
    }

    return response;
  }

  private buildGraph(threadId: string, sender: string, messages: string[]) {
    const graph = new StateGraph(EmailIntentSchema)
      .addNode(HandleErrorNode.name, this.handleErrorNodeCallback)
      .addNode(SummarizeMessagesNode.name, this.summarizeMessagesNodeCallback)
      .addNode(
        ClassifyMessageAsRFQNode.name,
        this.classifyEmailAsRFQNodeCallback,
      )
      .addNode(ExtractRFQDetailsNode.name, this.extractRFQDetailsNodeCallback)

      .addEdge(START, SummarizeMessagesNode.name)
      .addConditionalEdges(SummarizeMessagesNode.name, (state) =>
        nextOrErrorNode(state, ClassifyMessageAsRFQNode.name),
      )
      .addConditionalEdges(ClassifyMessageAsRFQNode.name, (state) => {
        const ifRFQExtractNode = (state: TEmailIntentSchemaType) => {
          if (state.isRFQ === true) {
            return ExtractRFQDetailsNode.name;
          } else if (state.isRFQ === false) {
            return END;
          }
        };

        return nextOrErrorNode(state, ifRFQExtractNode(state));
      })
      .addEdge(ExtractRFQDetailsNode.name, END)
      .addConditionalEdges(HandleErrorNode.name, ({ error }) => {
        const classifyError = this.classifyErrors(error);

        switch (classifyError) {
          case 'SCHEMA_VALIDATION_ERROR':
            return END;
          case 'REQUIRES_CLARIFICATION':
            return END; //TODO: Call a node that will fire an integration event, the useCase will fire a notification to the active workflow
          case 'REQUIRES_HUMAN_REVIEW':
            return END; //TODO: Call a node that will fire an integration event, the useCase will mark the the thread as requiring human review
          case 'RETRY':
            return END;
          default:
            return END;
        }
      })
      .compile();

    const initialState: TEmailIntentSchemaType = {
      threadId,
      messages,
      requestSummary: null,
      isRFQ: null,
      reason: null,
      expectedDeliveryDate: null,
      hasAttachments: null,
      items: null,
      customerDetail: {
        name: null,
        email: sender,
      },
      notes: null,
      error: null,
    };

    return {
      graph,
      initialState,
    };
  }

  private classifyErrors(error: TEmailIntentSchemaType['error']): string {
    return 'UNKNOWN_ERROR';
  }

  private handleErrorNodeCallback = async (state: TEmailIntentSchemaType) => {
    try {
      this.logger.debug('Handling error Node');
      this.logger.debug(`Handling error for thread ${state.threadId}:`, state.error);
      
      const result = await this.handleErrorNode.run(this.llmClient, {
        error: state.error,
      });
      
      if (!result) {
        this.logger.error('Handle error node returned undefined result');
        return { error: state.error }; // Preserve original error
      }
      
      return result;
    } catch (error) {
      this.logger.error('Error in handleErrorNodeCallback:', error);
      return { error: state.error }; // Preserve original error
    }
  };

  private summarizeMessagesNodeCallback = async (
    state: TEmailIntentSchemaType,
  ) => {
    try {
      this.logger.debug('Summarizing messages Node');
      this.logger.debug(`Processing ${state.messages?.length || 0} messages for thread ${state.threadId}`);
      
      // Validate input
      if (!state.messages || state.messages.length === 0) {
        this.logger.warn(`No messages to summarize for thread ${state.threadId}`);
        return { requestSummary: 'No messages to summarize' };
      }
      
      const result = await this.summarizeMessageNode.run(this.llmClient, {
        messages: state.messages,
        responseSchema: summarizeEmailOutputSchemaTxt,
      });
      
      if (!result) {
        this.logger.error('Summarize node returned undefined result');
        return { requestSummary: this.createFallbackSummary(state.messages) };
      }
      
      if (!result.summary) {
        this.logger.warn('Summarize node result missing summary property:', result);
        // Check if there's an error in the result
        if (result.error && result.error.length > 0) {
          this.logger.error('LLM returned error in summary result:', result.error);
          return { requestSummary: this.createFallbackSummary(state.messages) };
        }
        return { requestSummary: this.createFallbackSummary(state.messages) };
      }
      
      this.logger.debug(`Summary generated: "${result.summary.substring(0, 100)}..."`);
      return { requestSummary: result.summary };
    } catch (error) {
      this.logger.error('Error in summarizeMessagesNodeCallback:', error);
      // Provide a fallback summary based on the messages
      return { requestSummary: this.createFallbackSummary(state.messages || []) };
    }
  };

  private createFallbackSummary(messages: string[]): string {
    if (!messages || messages.length === 0) {
      return 'Empty email thread';
    }
    
    // Create a simple fallback summary
    const totalLength = messages.join(' ').length;
    const messageCount = messages.length;
    
    // Take first 200 characters of the first message as a basic summary
    const firstMessage = messages[0] || '';
    const preview = firstMessage.substring(0, 200).replace(/\s+/g, ' ').trim();
    
    return `Email thread with ${messageCount} message(s). Preview: ${preview}${preview.length >= 200 ? '...' : ''}`;
  }

  private processRelativeDate(dateString: string | null): string | null {
    if (!dateString) return null;
    
    // If already in ISO format, return as is
    if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/)) {
      return dateString.endsWith('Z') ? dateString : `${dateString}Z`;
    }
    
    const now = DateTime.now().setZone('UTC');
    const lowerDate = dateString.toLowerCase();
    
    // Handle relative date patterns
    if (lowerDate.includes('within') && lowerDate.includes('day')) {
      const daysMatch = lowerDate.match(/(\d+)\s*days?/);
      if (daysMatch) {
        const days = parseInt(daysMatch[1]);
        return now.plus({ days }).toISO();
      }
    }
    
    if (lowerDate.includes('within') && lowerDate.includes('week')) {
      const weeksMatch = lowerDate.match(/(\d+)\s*weeks?/);
      if (weeksMatch) {
        const weeks = parseInt(weeksMatch[1]);
        return now.plus({ weeks }).toISO();
      }
    }
    
    if (lowerDate.includes('asap') || lowerDate.includes('urgent') || lowerDate.includes('immediately')) {
      return now.plus({ days: 2 }).toISO(); // ASAP = 2 days
    }
    
    if (lowerDate.includes('end of month') || lowerDate.includes('eom')) {
      return now.endOf('month').toISO();
    }
    
    if (lowerDate.includes('end of week') || lowerDate.includes('eow')) {
      return now.endOf('week').toISO();
    }
    
    // Handle "Q1", "Q2", etc.
    const quarterMatch = lowerDate.match(/q([1-4])\s*(\d{4})?/);
    if (quarterMatch) {
      const quarter = parseInt(quarterMatch[1]);
      const year = quarterMatch[2] ? parseInt(quarterMatch[2]) : now.year;
      const quarterEnd = DateTime.fromObject({ year, month: quarter * 3, day: 1 }).endOf('month');
      return quarterEnd.toISO();
    }
    
    // If we can't parse it, return null
    this.logger.warn(`Unable to parse delivery date: "${dateString}"`);
    return null;
  }

  private classifyEmailAsRFQNodeCallback = async (
    state: TEmailIntentSchemaType,
  ) => {
    try {
      this.logger.debug('Classifying email as RFQ Node');
      this.logger.debug(`Classifying ${state.messages?.length || 0} messages for thread ${state.threadId}`);
      
      const result = await this.classifyEmailAsRFQNode.run(this.llmClient, {
        messages: state.messages,
        responseSchema: classifyMessageAsRFQOutputSchemaTxt,
      });
      
      if (!result) {
        this.logger.error('Classify RFQ node returned undefined result');
        return { isRFQ: false, reason: 'Classification failed - undefined result' };
      }
      
      this.logger.debug(`Classification result: isRFQ=${result.isRFQ}, reason="${result.reason}"`);
      return { isRFQ: result.isRFQ || false, reason: result.reason || 'No reason provided' };
    } catch (error) {
      this.logger.error('Error in classifyEmailAsRFQNodeCallback:', error);
      return { isRFQ: false, reason: 'Classification failed due to error' };
    }
  };

  private extractRFQDetailsNodeCallback = async (
    state: TEmailIntentSchemaType,
  ) => {
    try {
      this.logger.debug('Extracting RFQ details Node');
      this.logger.debug(`Extracting details from ${state.messages?.length || 0} messages for thread ${state.threadId}`);
      
      const result = await this.extractRFQDataNode.run(this.llmClient, {
        messages: state.messages,
        responseSchema: extractRFQDetailsOutputSchemaTxt,
      });
      
      if (!result) {
        this.logger.error('Extract RFQ details node returned undefined result');
        return {
          expectedDeliveryDate: null,
          items: null,
          customerDetail: state.customerDetail,
          notes: null,
          error: ['Failed to extract RFQ details - undefined result'],
        };
      }
      
      this.logger.debug(`Extracted ${result.items?.length || 0} items for thread ${state.threadId}`);
      
      // Process the delivery date to handle relative dates
      let processedDeliveryDate = result.expectedDeliveryDate;
      if (result.expectedDeliveryDate) {
        const originalDate = result.expectedDeliveryDate;
        processedDeliveryDate = this.processRelativeDate(originalDate) || '';
        
        if (processedDeliveryDate !== originalDate) {
          this.logger.log(`Converted relative date "${originalDate}" to "${processedDeliveryDate}" for thread ${state.threadId}`);
        }
      }
      
      return {
        expectedDeliveryDate: processedDeliveryDate,
        items: result.items || null,
        customerDetail: {
          ...state.customerDetail,
          name: result.customerDetail?.name || state.customerDetail?.name,
        },
        notes: result.notes || null,
        error: result.error || null,
      };
    } catch (error) {
      this.logger.error('Error in extractRFQDetailsNodeCallback:', error);
      return {
        expectedDeliveryDate: null,
        items: null,
        customerDetail: state.customerDetail,
        notes: null,
        error: [`Extraction failed: ${error.message}`],
      };
    }
  };
}
