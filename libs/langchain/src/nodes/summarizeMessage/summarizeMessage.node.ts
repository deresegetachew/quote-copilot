import { z } from 'zod';
import { NodesAbstract } from '../nodes.abstract';
import { Injectable, Logger } from '@nestjs/common';
import { PromptBody } from '../../../../prompts/src';
import { LLMClient } from '../../clients';
import {
  SummarizeMessagePromptBuilder,
  TSummarizeMessageInput,
  TSummarizeMessageOutput,
} from '@prompts';

@Injectable()
export class SummarizeEmailNode extends NodesAbstract<
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
    llmClient: LLMClient,
  ): Promise<TSummarizeMessageOutput> {
    this.logger = new Logger(SummarizeEmailNode.name);

    const prompt = await this.summarizeMessagePromptBuilder
      .setContext(input)
      .build();

    this.logger.debug('Prompt:', { prompt });

    const result = await llmClient.invokeLLM(prompt);

    return {
      ...input,
      summary: Array.isArray(result.content)
        ? result.content.join(' ')
        : result.content,
    };
  }
}
