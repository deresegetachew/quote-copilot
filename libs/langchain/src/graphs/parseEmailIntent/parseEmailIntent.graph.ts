import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class ParseEmailIntentGraph {
  // private readonly graph: StateGraph<TParseEmailIntentState>;
  logger = new Logger(ParseEmailIntentGraph.name);

  constructor(
    private summarizeMessageNode: SummarizeMessagesNode,
    private classifyEmailAsRFQNode: ClassifyMessageAsRFQNode,
    private extractRFQDataNode: ExtractRFQDetailsNode,
    private handleErrorNode: HandleErrorNode,
    private llmClient: LLMClient<TSummarizeMessageInput>,
  ) {
    this.llmClient.setStrategy('openAI');
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
    if (error.obj instanceof z.ZodError) {
      return 'SCHEMA_VALIDATION_ERROR';
    } else if (error.message.includes('requires clarification')) {
      return 'REQUIRES_CLARIFICATION';
    } else if (error.message.includes('requires human review')) {
      return 'REQUIRES_HUMAN_REVIEW';
    } else if (error.message.includes('retry')) {
      return 'RETRY';
    }
    return 'UNKNOWN_ERROR';
  }

  private handleErrorNodeCallback = async (state: TEmailIntentSchemaType) => {
    this.logger.debug('Handling error Node');
    return await this.handleErrorNode.run(this.llmClient, {
      error: state.error,
    });
  };

  private summarizeMessagesNodeCallback = async (
    state: TEmailIntentSchemaType,
  ) => {
    this.logger.debug('Summarizing messages Node');
    const result = await this.summarizeMessageNode.run(this.llmClient, {
      messages: state.messages,
      responseSchema: summarizeEmailOutputSchemaTxt,
    });
    return { requestSummary: result.summary };
  };

  private classifyEmailAsRFQNodeCallback = async (
    state: TEmailIntentSchemaType,
  ) => {
    this.logger.debug('Classifying email as RFQ Node');
    const result = await this.classifyEmailAsRFQNode.run(this.llmClient, {
      messages: state.messages,
      responseSchema: classifyMessageAsRFQOutputSchemaTxt,
    });
    return { isRFQ: result.isRFQ, reason: result.reason };
  };

  private extractRFQDetailsNodeCallback = async (
    state: TEmailIntentSchemaType,
  ) => {
    this.logger.debug('Extracting RFQ details Node');
    const result = await this.extractRFQDataNode.run(this.llmClient, {
      messages: state.messages,
      responseSchema: extractRFQDetailsOutputSchemaTxt,
    });
    return { rfqData: result };
  };
}
