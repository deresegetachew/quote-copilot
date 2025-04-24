import { Injectable } from '@nestjs/common';
import { ProcessEmailThreadWFPort } from '../../../application/ports/outgoing/processEmailThreadWF.port';
import { WorkflowClient } from '@temporalio/client';
import { TASK_QUEUES, WORKFLOW_NAMES, WORKFLOW_SIGNALS } from '@common';

@Injectable()
export class ProcessEmailThreadWFAdapter implements ProcessEmailThreadWFPort {
  constructor(private readonly client: WorkflowClient) {}

  async startEmailThreadWorkflow(
    threadId: string,
    messageId: string,
    signal: (typeof WORKFLOW_SIGNALS)[keyof typeof WORKFLOW_SIGNALS],
  ): Promise<void> {
    await this.client.signalWithStart(WORKFLOW_NAMES.PROCESS_EMAIL_THREAD, {
      taskQueue: TASK_QUEUES.EMAIL_TASKS_AGENT_ORCHESTRATOR, // move this to const
      workflowId: `email-thread-${threadId}`,
      args: [],
      signal, //this should be dynamic passed as props probably
      signalArgs: [{ threadId, messageId }],
    });
  }
}
