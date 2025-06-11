import { Injectable, Logger } from '@nestjs/common';
import { NodesAbstract } from '../nodes.abstract';
import { z } from 'zod';

@Injectable()
export class HandleErrorNode extends NodesAbstract<
  any,
  { error: string[] | null }
> {
  constructor() {
    super(undefined, undefined);
  }

  protected async nodeTask(error: any): Promise<{ error: string[] | null }> {
    if (error instanceof z.ZodError) {
      this.logger.error('Node error::Zod validation error:', error.errors);
      return { error: error.errors.map((e: any) => e.message) };
    } else {
      this.logger.error('Node error::', { error });
      return { error: [error?.message ?? String(error)] };
    }
  }

  protected validateResponse(result: { error: string[] | null }): {
    error: string[] | null;
  } {
    // No validation needed for error handling node
    return result;
  }
}
