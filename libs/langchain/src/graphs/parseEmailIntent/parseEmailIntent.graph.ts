import { Injectable, Scope } from '@nestjs/common';
import { LLMClient } from '../../clients';
import {
  classifyMessageAsRFQOutputSchemaTxt,
  PromptBody,
  summarizeEmailOutputSchemaTxt,
} from '@prompts';
import { AIMessageChunk } from '@langchain/core/messages';
import { validate } from '@langchain/core/dist/utils/fast-json-patch';
import { SummarizeEmailNode } from '../../nodes/summarizeMessage/summarizeMessage.node';
import {
  StateGraph,
  START,
  END,
  MessagesAnnotation,
  CompiledStateGraph,
} from '@langchain/langgraph';
import { ClassifyEmailAsRFQNode } from '../../nodes/classifyMessageAsRFQ.node';
import { ExtractRFQDetailsNode } from '../../nodes/extractRFQDetails.node';

type ParseEmailIntentResponse =
  | { status: 'RFQ_PARSED'; data: any }
  | { status: 'INCOMPLETE_RFQ'; data: any }
  | { status: 'NOT_RFQ'; data: null };

// To continue from here, this state is within in langGraph ?that is shared across each node ?
type parseEmailIntentState = {
  messages: string[];
  summary: string | null;
  isRFQ: boolean | null;
  reason: string | null;
  rfqData: any | null;
};

@Injectable()
export class ParseEmailIntentGraph {
  private readonly graph: StateGraph<parseEmailIntentState>;
  private app: any;

  constructor(
    private summarizeEmailNode: SummarizeEmailNode,
    private classifyEmailAsRFQNode: ClassifyEmailAsRFQNode,
    private extractRFQDataNode: ExtractRFQDetailsNode,
    private llmClient: LLMClient,
  ) {
    this.graph = new StateGraph(MessagesAnnotation);
    this.app = this.buildGraph();
  }

  async parseEmailWithLLM(
    messages: string[],
  ): Promise<ParseEmailIntentResponse> {
    this.llmClient.setStrategy('openAI');

    const state = {
      messages,
      summary: null,
    };

    const response = await this.app.invoke(state);
    if (!response) {
      throw new Error('Failed to parse email');
    } else {
      // determine status based on response (simplified for now)
      if (!response.summary) {
        return { status: 'INCOMPLETE_RFQ', data: null };
      }

      return { status: 'RFQ_PARSED', data: response };
    }
  }

  buildGraph() {
    return this.graph
      .addNode(SummarizeEmailNode.name, async (state) => {
        const result = await this.summarizeEmailNode.run(this.llmClient, {
          messages: state.messages,
          responseSchema: summarizeEmailOutputSchemaTxt,
        });
        return { summary: result.summary };
      })
      .addNode(ClassifyEmailAsRFQNode.name, async (state) => {
        const result = await this.classifyEmailAsRFQNode.run(this.llmClient, {
          messages: state.messages,
          responseSchema: classifyMessageAsRFQOutputSchemaTxt,
        });
        return { ...state, ...result };
      })
      .addNode(ExtractRFQDetailsNode.name, async (state) => {
        const result = await this.extractRFQDataNode.run(this.llmClient, {
          messages: state.messages,
          responseSchema: classifyMessageAsRFQOutputSchemaTxt,
        });
        return { ...state, ...result };
      })
      .addEdge(START, SummarizeEmailNode.name)
      .addEdge(SummarizeEmailNode.name, ClassifyEmailAsRFQNode.name)
      .addEdge(ClassifyEmailAsRFQNode.name, END)
      .compile();

    // this.graph.addEdge(SummarizeEmailNode.name, ClassifyEmailAsRFQNode.name);
    // this.graph.addEdge(ClassifyEmailAsRFQNode.name, END);

    // this.graph.addNode(
    //   ClassifyEmailAsRFQNode.name,
    //   this.classifyEmailAsRFQNode.run,
    // );
    // this.graph.addNode(ExtractRFQDataNode.name, this.extractRFQDataNode.run);
    // this.graph.addNode(ValidateRFQDataNode.name, this.validateRFQDataNode.run);
  }
}
