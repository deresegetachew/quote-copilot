import { Module } from '@nestjs/common';
import { PromptsService } from './services/prompts.service';
import { PromptFactory } from './promptFactory';

@Module({
  providers: [PromptsService, PromptFactory],
  exports: [PromptsService, PromptFactory],
})
export class PromptsModule {}
