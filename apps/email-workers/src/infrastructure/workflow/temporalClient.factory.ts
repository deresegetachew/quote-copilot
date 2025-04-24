import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, WorkflowClient } from '@temporalio/client';

@Injectable()
export class TemporalClientFactory {
  private client: WorkflowClient;

  constructor(private readonly configService: ConfigService) {}

  async createClient(): Promise<WorkflowClient> {
    if (!this.client) {
      const namespace =
        this.configService.get('temporal.namespace') ?? 'default';
      const address =
        this.configService.get('temporal.server') ?? 'localhost:7233';

      const connection = await Connection.connect({ address });

      this.client = new WorkflowClient({
        namespace,
        connection,
      });
    }

    return this.client;
  }
}
