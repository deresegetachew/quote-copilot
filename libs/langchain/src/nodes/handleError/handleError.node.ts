import { Injectable, Logger } from '@nestjs/common';
import { NodesAbstract } from '../nodes.abstract';
import { z } from 'zod';

@Injectable()
export class HandleErrorNode extends NodesAbstract<any, undefined> {
  constructor() {
    super();
  }

  protected async nodeTask(error: any): Promise<undefined> {
    if (error instanceof z.ZodError) {
      this.logger.error('Node error::Zod validation error:', error.errors);
    } else {
      this.logger.error('Node error::', { error });
    }
  }
}
