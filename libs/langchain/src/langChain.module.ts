import { Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ParseEmailIntentGraph } from './graphs/parseEmailIntent/parseEmailIntent.graph';
import { OpenAIClient } from './clients/openai.client';
import { OllamaClient } from './clients/ollama.client';
import { LLMClient } from './clients';
import { ClassifyMessageAsRFQNode } from './nodes/classifyMessageAsRFQ/classifyMessageAsRFQ.node';
import { ExtractRFQDetailsNode } from './nodes/extractRFQDetails/extractRFQDetails.node';
import { HandleErrorNode } from './nodes/handleError/handleError.node';
import { SummarizeMessagesNode } from './nodes/summarizeMessages/summarizeMessages.node';
import { PromptsModule } from '@prompts';

const Graphs: Provider[] = [ParseEmailIntentGraph];

const Nodes: Provider[] = [
  SummarizeMessagesNode,
  ClassifyMessageAsRFQNode,
  ExtractRFQDetailsNode,
  HandleErrorNode,
];

@Module({
  imports: [PromptsModule],
  providers: [
    ConfigService,
    OpenAIClient,
    OllamaClient,
    LLMClient,
    ...Graphs,
    ...Nodes,
  ],
  exports: [ParseEmailIntentGraph],
})
export class LangChainModule {}
