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

    this.logger.debug('ClassifyMessageAsRFQNode:');

    return await llmClient.invokeLLM(prompt, classifyMessageAsRFQOutputSchema);
  }

  protected validateResponse(
    result: TClassifyMessageAsRFQOutput,
  ): TClassifyMessageAsRFQOutput {
    try {
      const validatedResult = classifyMessageAsRFQOutputSchema.parse(result);
      return validatedResult;
    } catch (err) {
      this.logger.error('::ClassifyMessageAsRFQNode::', {
        error: err,
      });
      throw err;
    }
  }
}
