import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ParseEmailIntentGraph } from './graphs/parseEmailIntent/parseEmailIntent.graph';
import { OpenAIClient } from './clients/openai.client';
import { OllamaClient } from './clients/ollama.client';
import { LLMClient } from './clients';

@Module({
  providers: [
    ConfigService,
    ParseEmailIntentGraph,
    OpenAIClient,
    OllamaClient,
    LLMClient,
  ],
  exports: [ParseEmailIntentGraph],
})
export class LangChainModule {}
