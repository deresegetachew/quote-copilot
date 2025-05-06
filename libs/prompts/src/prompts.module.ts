import { Module } from '@nestjs/common';
import { PromptsService } from './services/prompts.service';
import { ParseCustomerRFQEmailPromptBuilder } from './llmPrompts/builder';

@Module({
  providers: [
    PromptsService,
    // ParseCustomerRFQEmailPromptBuilder, // we can use hte factory instead
  ],
  exports: [PromptsService],
})
export class PromptsModule {}
