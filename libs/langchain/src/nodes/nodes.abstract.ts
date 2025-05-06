import { RunnableLambda } from '@langchain/core/runnables';
import { LLMClient } from '../clients';
import { z, ZodSchema } from 'zod';
import { AIClientTypes } from '@common';

export abstract class NodesAbstract<Input, Output> {
  constructor() {}

  private inputSchema: ZodSchema<Input>;
  private outputSchema: ZodSchema<Output>;

  protected abstract nodeTask(
    input: z.infer<ZodSchema<Input>>,
    llmClient: LLMClient,
  ): Promise<z.infer<ZodSchema<Output>>>;

  //  TODO: use https://github.com/connor4312/cockatiel so that  nodes can retry if they fail
  public async run(
    llmClient: LLMClient,
    input: z.infer<ZodSchema<Input>>,
  ): Promise<Output> {
    const parsedInput = this.inputSchema.parse(input);
    const result = await this.nodeTask(parsedInput, llmClient);
    return this.outputSchema.parse(result);
  }
}
