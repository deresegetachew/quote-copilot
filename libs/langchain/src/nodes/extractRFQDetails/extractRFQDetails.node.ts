import { Injectable, Logger } from '@nestjs/common';
import { NodesAbstract } from '../nodes.abstract';
import { LLMClient } from '../../clients';
import {
  TExtractRFQDetailsInput,
  TExtractRFQDetailsOutput,
  ExtractRFQDetailsPromptBuilder,
  extractRFQDetailsOutputSchema,
  extractRFQDetailsInputSchema,
} from '@prompts';
import { z } from 'zod';

@Injectable()
export class ExtractRFQDetailsNode extends NodesAbstract<
  TExtractRFQDetailsInput,
  TExtractRFQDetailsOutput
> {
  logger: Logger;

  constructor(
    private extractRFQDetailsPromptBuilder: ExtractRFQDetailsPromptBuilder,
  ) {
    super(extractRFQDetailsInputSchema, extractRFQDetailsOutputSchema);
  }

  protected async nodeTask(
    input: TExtractRFQDetailsInput,
    llmClient: LLMClient<TExtractRFQDetailsInput>,
  ): Promise<TExtractRFQDetailsOutput> {
    this.logger = new Logger(ExtractRFQDetailsNode.name);

    const prompt = await this.extractRFQDetailsPromptBuilder
      .setContext(input)
      .build();

    this.logger.debug('ExtractRFQDetailsNode:');

    const result = await llmClient.invokeLLM<
      typeof extractRFQDetailsOutputSchema
    >(prompt, extractRFQDetailsOutputSchema);

    return result;
  }

  protected validateResponse(
    result: TExtractRFQDetailsOutput,
  ): TExtractRFQDetailsOutput {
    try {
      const validatedResult = extractRFQDetailsOutputSchema.parse(result);
      return validatedResult;
    } catch (err) {
      if (err instanceof z.ZodError) {
        return {
          ...result,
          error: err.errors.map((e) => `${e.path} ${e.message}`),
        };
      }

      // break the graph we dont know what happened
      throw err;
    }
  }
}
