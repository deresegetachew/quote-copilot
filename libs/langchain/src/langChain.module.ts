import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ParseEmailIntentGraph } from './graphs/parseEmailIntent.graph';
import { OpenAIClient } from './clients/openai.client';

@Module({
  providers: [ConfigService, ParseEmailIntentGraph, OpenAIClient],
  exports: [ParseEmailIntentGraph],
})
export class LangChainModule {}
