import { defineSignal } from '@temporalio/workflow';
import { WORKFLOW_SIGNALS } from '@common';

export interface NewMessageSignalPayload {
  messageId: string;
}

export const NEW_MESSAGE_SIGNAL = defineSignal<[NewMessageSignalPayload]>(
  WORKFLOW_SIGNALS.NEW_MESSAGE,
);
