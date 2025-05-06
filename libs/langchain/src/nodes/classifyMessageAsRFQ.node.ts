import { Injectable, Logger } from '@nestjs/common';
import { NodesAbstract } from './nodes.abstract';
import { LLMClient } from '../clients';
import {
  ClassifyMessageAsRFQPromptBuilder,
  summarizeEmailOutputSchema,
  summarizeEmailOutputSchemaTxt,
} from '@prompts';
import {
  TClassifyMessageAsRFQInput,
  TClassifyMessageAsRFQOutput,
} from '@prompts';

type LLMResponseContent = {
  isRFQ: boolean;
  reason: string;
};

@Injectable()
export class ClassifyEmailAsRFQNode extends NodesAbstract<
  TClassifyMessageAsRFQInput,
  TClassifyMessageAsRFQOutput
> {
  logger: Logger;

  constructor(
    private classifyMessageAsRFQPromptBuilder: ClassifyMessageAsRFQPromptBuilder,
  ) {
    super();
  }

  protected async nodeTask(
    input: TClassifyMessageAsRFQInput,
    llmClient: LLMClient,
  ): Promise<TClassifyMessageAsRFQOutput> {
    this.logger = new Logger(ClassifyEmailAsRFQNode.name);

    const prompt = await this.classifyMessageAsRFQPromptBuilder
      .setContext(input)
      .build();

    this.logger.debug('Prompt:', { prompt });

    const result = await llmClient.invokeLLM(prompt);

    const resultContent = result.content as unknown;

    if (
      typeof resultContent === 'object' &&
      resultContent !== null &&
      'isRFQ' in resultContent &&
      'reason' in resultContent
    ) {
      const content = resultContent as LLMResponseContent;

      return {
        ...input,
        isRFQ: content.isRFQ,
        reason: content.reason,
      };
    }

    throw new Error('Unexpected response format from LLM');
  }
}
