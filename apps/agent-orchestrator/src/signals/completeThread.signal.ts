import { defineSignal } from '@temporalio/workflow';
import { WORKFLOW_SIGNALS } from '@common';

export interface CompleteThreadSignalPayload {
  threadId: string;
}

export const COMPLETE_THREAD_SIGNAL = defineSignal<
  [CompleteThreadSignalPayload]
>(WORKFLOW_SIGNALS.COMPLETE_THREAD);
