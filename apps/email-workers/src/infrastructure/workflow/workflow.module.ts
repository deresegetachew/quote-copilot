import { Module } from '@nestjs/common';
import { TemporalClientFactory } from './temporalClient.factory';
import { WorkflowClient } from '@temporalio/client';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    TemporalClientFactory,
    {
      provide: WorkflowClient,
      useFactory: async (factory: TemporalClientFactory) =>
        factory.createClient(),
      inject: [TemporalClientFactory, ConfigService],
    },
  ],
  exports: [WorkflowClient],
})
export class WorkflowModule {}
