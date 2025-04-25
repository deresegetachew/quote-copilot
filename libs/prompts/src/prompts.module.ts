import { Module } from '@nestjs/common';
import { PromptsService } from './services/prompts.service';
import { PromptFactory } from './promptFactory';
import { ParseCustomerRFQEmailPromptBuilder } from './llmPrompts/builder';

@Module({
  providers: [
    PromptsService,
    PromptFactory,
    ParseCustomerRFQEmailPromptBuilder,
  ],
  exports: [PromptsService, PromptFactory],
})
export class PromptsModule {}
