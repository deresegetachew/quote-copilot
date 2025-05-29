import { NodesAbstract } from '../nodes.abstract';
import { Injectable, Logger } from '@nestjs/common';
import { LLMClient } from '../../clients';
import {
  summarizeEmailInputSchema,
  summarizeEmailOutputSchema,
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
    super(summarizeEmailInputSchema, summarizeEmailOutputSchema);
  }

  protected async nodeTask(
    input: TSummarizeMessageInput,
    llmClient: LLMClient<TSummarizeMessageInput>,
  ): Promise<TSummarizeMessageOutput> {
    this.logger = new Logger(SummarizeMessagesNode.name);

    const prompt = await this.summarizeMessagePromptBuilder
      .setContext(input)
      .build();

    this.logger.debug('SummarizeMessages node:');

    return await llmClient.invokeLLM<typeof summarizeEmailOutputSchema>(
      prompt,
      summarizeEmailOutputSchema,
    );
  }

  protected validateResponse(
    result: TSummarizeMessageOutput,
  ): TSummarizeMessageOutput {
    try {
      const validatedResult = summarizeEmailOutputSchema.parse(result);
      return validatedResult;
    } catch (error) {
      this.logger.error('::SummarizeMessagesNode::', {
        error,
      });

      throw error;
    }
  }
}
