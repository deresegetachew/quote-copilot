import { proxyActivities, setHandler, sleep } from '@temporalio/workflow';
import {
  COMPLETE_THREAD_SIGNAL,
  CompleteThreadSignalPayload,
  NEW_MESSAGE_SIGNAL,
  NewMessageSignalPayload,
} from '../../signals';
import type * as activities from '../../activities';

const { parseEmailIntentActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
});

const { fireIntegrationEventsActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

// TO AB: Once the activity starts running, it must finish within 5 minutes. Otherwise, it will be marked as failed (and possibly retried).
const { sendEmailActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
  retry: {
    maximumAttempts: 3,
    initialInterval: '1s',
    backoffCoefficient: 2,
    maximumInterval: '10s',
  },
});

type TEmailThreadWorkflowState = {
  isDone: boolean;
  threadId: string | null;
  queue: NewMessageSignalPayload[];
  summary: string | null;
  latestRFQ: {
    rfqData: any;
    reason: string;
    isRFQ: boolean;
  } | null;
  status: 'WAITING' | 'RFQ_PARSED' | 'NOT_RFQ' | 'INCOMPLETE_RFQ' | null;
  requiresHumanReview?: boolean;
};

export async function processEmailThreadWorkflow(): Promise<void> {
  const state: TEmailThreadWorkflowState = {
    isDone: false,
    threadId: null,
    queue: [],
    summary: null,
    latestRFQ: null,
    status: null,
    requiresHumanReview: false,
  };

  setHandler(NEW_MESSAGE_SIGNAL, (payload: NewMessageSignalPayload) => {
    state.threadId = payload.threadId;
    state.queue.push({
      threadId: payload.threadId,
      messageId: payload.messageId,
    });
  });

  setHandler(COMPLETE_THREAD_SIGNAL, (payload: CompleteThreadSignalPayload) => {
    console.log(
      `Received complete thread signal for threadId: ${payload.threadId}`,
    );
    state.isDone = true;
  });

  while (!state.isDone) {
    while (state.queue.length > 0) {
      const { messageId } = state.queue.shift()!;

      // Step 1: Once
      if (!state.threadId)
        throw new Error('Thread ID is not set. Cannot process message.');

      const parsed = await parseEmailIntentActivity(state.threadId, messageId);

      /***
       * after parsing we call fireIntegrationEventActivity
       * the workflow needs to be deterministic and based on the parsed data we will branch and call different activities
       */

      if (parsed.isRFQ) {
        state.status = 'RFQ_PARSED';
        state.latestRFQ = {
          rfqData: parsed.rfqData,
          reason: parsed.reason,
          isRFQ: true,
        };
        state.summary = parsed.summary;
      } else {
        console.log('Not an RFQ');

        state.isDone = true; //this thread is done and should close it
      }
    }

    await sleep('5s'); // avoid busy-looping
  }
}
