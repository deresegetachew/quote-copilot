import { WORKFLOW_SIGNALS } from '@common';

export abstract class ProcessEmailThreadWFPort {
  abstract startEmailThreadWorkflow(
    threadId: string,
    messageId: string,
    signal: (typeof WORKFLOW_SIGNALS)[keyof typeof WORKFLOW_SIGNALS],
  ): Promise<void>;
}
