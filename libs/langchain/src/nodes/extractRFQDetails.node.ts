import { Injectable, Logger } from '@nestjs/common';
import { NodesAbstract } from './nodes.abstract';
import { LLMClient } from '../clients';
import {
  TExtractRFQDetailsInput,
  TExtractRFQDetailsOutput,
  ExtractRFQDetailsPromptBuilder,
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
    super();
  }

  protected async nodeTask(
    input: TExtractRFQDetailsInput,
    llmClient: LLMClient,
  ): Promise<TExtractRFQDetailsOutput> {
    this.logger = new Logger(ExtractRFQDetailsNode.name);

    const prompt = await this.extractRFQDetailsPromptBuilder
      .setContext(input)
      .build();

    this.logger.debug('Prompt:', { prompt });

    const result = await llmClient.invokeLLM(prompt);

    if (typeof result.content === 'object' && result.content !== null) {
      return result.content as TExtractRFQDetailsOutput;
    }

    throw new Error('Unexpected response format from LLM');
  }
}
