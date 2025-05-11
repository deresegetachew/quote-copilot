import { LLMClient } from '../clients';
import { z, ZodSchema } from 'zod';
import { Logger } from '@nestjs/common';
import { TBaseNodeOutput } from '../../../prompts/src/llmPrompts/builder/base.schema';

export abstract class NodesAbstract<Input, Output extends TBaseNodeOutput> {
  constructor() {}
  protected logger = new Logger(NodesAbstract.name);

  private inputSchema: ZodSchema<Input>;
  private outputSchema: ZodSchema<Output>;

  protected abstract nodeTask(
    input: z.infer<ZodSchema<Input>>,
    llmClient: LLMClient<Input>,
  ): Promise<z.infer<ZodSchema<Output>>>;

  //  TODO: use https://github.com/connor4312/cockatiel so that  nodes can retry if they fail
  public async run(
    llmClient: LLMClient<Input>,
    input: z.infer<ZodSchema<Input>>,
  ): Promise<Output> {
    try {
      if (!llmClient) {
        throw new Error('LLMClient is not provided');
      }

      const parsedInput = this.inputSchema.parse(input);
      const result = await this.nodeTask(parsedInput, llmClient);

      return this.outputSchema.parse(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return this.outputSchema.parse({
          message: err.message,
          error: err,
        });
      } else if (err instanceof Error) {
        this.logger.error('Node error::', { error: err });
        return this.outputSchema.parse({
          message: err.message,
          obj: err,
        });
      }
      return this.outputSchema.parse({
        message: 'Unknown error',
        obj: err,
      });
    }
  }
}
