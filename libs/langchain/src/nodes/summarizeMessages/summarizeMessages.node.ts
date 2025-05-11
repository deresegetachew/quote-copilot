import { z } from 'zod';
import { NodesAbstract } from '../nodes.abstract';
import { Injectable, Logger } from '@nestjs/common';
import {
  PromptBody,
  summarizeEmailOutputSchema,
} from '../../../../prompts/src';
import { LLMClient } from '../../clients';
import {
  SummarizeMessagePromptBuilder,
  TSummarizeMessageInput,
  TSummarizeMessageOutput,
} from '@prompts';

@Injectable()
export class SummarizeMessagesNode extends NodesAbstract<
  TSummarizeMessageInput,
  TSummarizeMessageOutput
> {
  logger: Logger;

  constructor(
    private summarizeMessagePromptBuilder: SummarizeMessagePromptBuilder, // Replace with actual type
  ) {
    super();
  }

  protected async nodeTask(
    input: TSummarizeMessageInput,
    llmClient: LLMClient<TSummarizeMessageInput>,
  ): Promise<TSummarizeMessageOutput> {
    this.logger = new Logger(SummarizeMessagesNode.name);

    const prompt = await this.summarizeMessagePromptBuilder
      .setContext(input)
      .build();

    this.logger.debug('Prompt:', { prompt });

    return await llmClient.invokeLLM<typeof summarizeEmailOutputSchema>(
      prompt,
      summarizeEmailOutputSchema,
    );
  }
}
