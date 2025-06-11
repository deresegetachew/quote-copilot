import { LLMClient } from '../clients';
import { z, ZodSchema } from 'zod';
import { Logger } from '@nestjs/common';
import { TBaseNodeOutput } from '../../../prompts/src/llmPrompts/builder/base.schema';

export abstract class NodesAbstract<Input, Output extends TBaseNodeOutput> {
  protected logger = new Logger(NodesAbstract.name);

  constructor(
    private readonly inputSchema?: ZodSchema<Input>,
    private readonly outputSchema?: ZodSchema<Output>,
  ) {}

  protected abstract nodeTask(
    input: z.infer<ZodSchema<Input>>,
    llmClient: LLMClient<Input>,
  ): Promise<z.infer<ZodSchema<Output>>>;

  protected abstract validateResponse(
    result: z.infer<ZodSchema<Output>>,
  ): z.infer<ZodSchema<Output>>;

  //  TODO: use https://github.com/connor4312/cockatiel so that  nodes can retry if they fail
  public async run(
    llmClient: LLMClient<Input>,
    input: z.infer<ZodSchema<Input>>,
  ): Promise<Output | undefined> {
    try {
      if (!llmClient) {
        throw new Error('LLMClient is not provided');
      }

      const parsedInput = this.inputSchema
        ? this.inputSchema.parse(input)
        : input;
      const result = await this.nodeTask(parsedInput, llmClient);
      this.logger.debug('Node result:', { result });

      return this.validateResponse(result);
    } catch (err) {
      this.logger.error('Node error:', { error: err });
      return undefined;
    }
  }
}
