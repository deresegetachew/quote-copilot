import { Module } from '@nestjs/common';
import { PromptsService } from './services/prompts.service';
import {
  ClassifyMessageAsRFQPromptBuilder,
  ExtractRFQDetailsPromptBuilder,
  ParseCustomerRFQEmailPromptBuilder,
  SummarizeMessagePromptBuilder,
} from './llmPrompts/builder';
// import { PromptFactory } from './promptFactory';

@Module({
  providers: [
    PromptsService,
    ClassifyMessageAsRFQPromptBuilder,
    ExtractRFQDetailsPromptBuilder,
    SummarizeMessagePromptBuilder,
  ],
  exports: [
    PromptsService,
    ClassifyMessageAsRFQPromptBuilder,
    ExtractRFQDetailsPromptBuilder,
    SummarizeMessagePromptBuilder,
  ],
})
export class PromptsModule {}
