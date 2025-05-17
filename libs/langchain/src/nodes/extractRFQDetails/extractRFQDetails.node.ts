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

    this.logger.debug('ExtractRFQDetailsNode:', { prompt });

    return await llmClient.invokeLLM<typeof extractRFQDetailsOutputSchema>(
      prompt,
      extractRFQDetailsOutputSchema,
    );
  }
}
