import { proxyActivities, setHandler, sleep } from '@temporalio/workflow';
import {
  COMPLETE_THREAD_SIGNAL,
  CompleteThreadSignalPayload,
  NEW_MESSAGE_SIGNAL,
  NewMessageSignalPayload,
} from '../../signals';
import type * as activities from '../../activities';
import { logParsedEmailWorkflow } from './childWorkFlows/sampleChild.workflow';
import { EMAIL_ENUMS } from '@common';
import { executeWorkflow } from '../../util/executeWF';

const { parseEmailIntentActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
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

export async function processEmailThreadWorkflow(): Promise<void> {
  const state = {
    queue: [] as NewMessageSignalPayload[],
    isDone: false,
    counter: 0,
  };

  setHandler(NEW_MESSAGE_SIGNAL, (payload: NewMessageSignalPayload) => {
    state.queue.push(payload);
    state.counter++; // increment on new signal
  });

  setHandler(COMPLETE_THREAD_SIGNAL, (payload: CompleteThreadSignalPayload) => {
    console.log(
      `Received complete thread signal for threadId: ${payload.threadId}`,
    );
    state.isDone = true;
  });

  while (!state.isDone) {
    while (state.queue.length > 0) {
      const { threadId, messageId } = state.queue.shift()!;

      //  Step 1: We send confirmation email to the user, and start parsing the email

      await sendEmailActivity({
        email: EMAIL_ENUMS.REQUEST_RECEIVED,
        threadId,
        inReplyToMessageId: messageId,
      });

      // Step 2: Once

      const parsed = await parseEmailIntentActivity(threadId, messageId);

      // execute sub workflows based on the parsed intent
      switch (parsed.quantity) {
        case 1:
          await executeWorkflow(logParsedEmailWorkflow, {
            args: [parsed],
            asChild: true,
            workflowId: `rfq-intent-${threadId}`,
          });
          break;
        default:
          throw new Error(`Unknown intent: ${parsed.quantity}`);
      }
    }

    await sleep('5s'); // avoid busy-looping
  }
}
