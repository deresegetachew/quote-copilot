import { Injectable, Logger } from '@nestjs/common';
import { LLMClient } from '../../clients';
import {
  classifyMessageAsRFQOutputSchemaTxt,
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

// type TError = {
//   message: string;
//   obj: Error;
// };

const ErrorSchema = z.object({
  message: z.string(),
  obj: z.any(),
});

const StateSchema = z.object({
  summary: z.string().nullable(),
  isRFQ: z.boolean().nullable(),
  reason: z.string().nullable(),
  rfqData: z.any().nullable(),
  error: ErrorSchema.nullable(),
  messages: z
    .array(z.string())
    .default(() => [])
    .transform((current) => current.flat()),
});

export type TParseEmailIntentState = z.infer<typeof StateSchema>;

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
    // this.graph = new StateGraph(MessagesAnnotation);
    this.llmClient.setStrategy('openAI');
  }

  async parseEmailWithLLM(messages: string[]): Promise<TParseEmailIntentState> {
    const graph = this.buildGraph();

    const state: TParseEmailIntentState = {
      messages,
      summary: null,
      isRFQ: null,
      reason: null,
      rfqData: null,
      error: null,
    };

    const response: TParseEmailIntentState | undefined =
      await graph.invoke(state);

    if (!response) {
      throw new Error('Failed to parse email');
    }

    return response;
  }

  buildGraph() {
    const graph = new StateGraph(StateSchema);
    return graph
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
      .addConditionalEdges(ClassifyMessageAsRFQNode.name, (state) =>
        nextOrErrorNode(state, ExtractRFQDetailsNode.name),
      )
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
  }

  classifyErrors(error: z.infer<typeof ErrorSchema>): string {
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

  private handleErrorNodeCallback = async (state: TParseEmailIntentState) => {
    this.logger.debug('Handling error Node');
    return await this.handleErrorNode.run(this.llmClient, {
      error: state.error,
    });
  };

  private summarizeMessagesNodeCallback = async (
    state: TParseEmailIntentState,
  ) => {
    this.logger.debug('Summarizing messages Node');
    const result = await this.summarizeMessageNode.run(this.llmClient, {
      messages: state.messages,
      responseSchema: summarizeEmailOutputSchemaTxt,
    });
    return { summary: result.summary };
  };

  private classifyEmailAsRFQNodeCallback = async (
    state: TParseEmailIntentState,
  ) => {
    this.logger.debug('Classifying email as RFQ Node');
    const result = await this.classifyEmailAsRFQNode.run(this.llmClient, {
      messages: state.messages,
      responseSchema: classifyMessageAsRFQOutputSchemaTxt,
    });
    return { isRFQ: result.isRFQ, reason: result.reason };
  };

  private extractRFQDetailsNodeCallback = async (
    state: TParseEmailIntentState,
  ) => {
    this.logger.debug('Extracting RFQ details Node');
    const result = await this.extractRFQDataNode.run(this.llmClient, {
      messages: state.messages,
      responseSchema: classifyMessageAsRFQOutputSchemaTxt,
    });
    return { rfqData: result };
  };
}
