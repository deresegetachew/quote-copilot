import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Worker } from '@temporalio/worker';
import * as path from 'path';
import * as activities from './activities';
import { TASK_QUEUES } from '../../../libs/common/src';

@Injectable()
export class OrchestratorService implements OnModuleDestroy {
  private worker: Worker;
  private readonly logger = new Logger(OrchestratorService.name);

  async startWorker() {
    this.logger.log('Starting Temporal worker...');

    this.worker = await Worker.create({
      workflowsPath: path.resolve(__dirname, './workflows'),
      activities,
      taskQueue: TASK_QUEUES.EMAIL_TASKS_AGENT_ORCHESTRATOR,
    });

    this.logger.log('🚀 Temporal Worker running...');

    await this.worker.run().catch((err) => {
      console.error('❌ Temporal Worker failed:', err);
      process.exit(1);
    });
  }

  async onModuleDestroy() {
    if (this.worker) {
      this.logger.warn('🛑 Shutting down Temporal Worker...');
      await this.worker.shutdown();
    }
  }
}
