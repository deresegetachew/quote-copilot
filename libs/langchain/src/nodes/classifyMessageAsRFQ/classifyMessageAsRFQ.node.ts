import { Injectable, Logger } from '@nestjs/common';
import { NodesAbstract } from '../nodes.abstract';
import { LLMClient } from '../../clients';
import {
  classifyMessageAsRFQInputSchema,
  classifyMessageAsRFQOutputSchema,
  ClassifyMessageAsRFQPromptBuilder,
} from '@prompts';
import {
  TClassifyMessageAsRFQInput,
  TClassifyMessageAsRFQOutput,
} from '@prompts';

@Injectable()
export class ClassifyMessageAsRFQNode extends NodesAbstract<
  TClassifyMessageAsRFQInput,
  TClassifyMessageAsRFQOutput
> {
  logger: Logger;

  constructor(
    private classifyMessageAsRFQPromptBuilder: ClassifyMessageAsRFQPromptBuilder,
  ) {
    super(classifyMessageAsRFQInputSchema, classifyMessageAsRFQOutputSchema);
  }

  protected async nodeTask(
    input: TClassifyMessageAsRFQInput,
    llmClient: LLMClient<TClassifyMessageAsRFQInput>,
  ): Promise<TClassifyMessageAsRFQOutput> {
    this.logger = new Logger(ClassifyMessageAsRFQNode.name);

    const prompt = await this.classifyMessageAsRFQPromptBuilder
      .setContext(input)
      .build();

    this.logger.debug('ClassifyMessageAsRFQNode:', { prompt });

    return await llmClient.invokeLLM(prompt, classifyMessageAsRFQOutputSchema);
  }
}
