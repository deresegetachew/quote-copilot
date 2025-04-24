import { proxyActivities, setHandler, sleep } from '@temporalio/workflow';
import {
  COMPLETE_THREAD_SIGNAL,
  CompleteThreadSignalPayload,
  NEW_MESSAGE_SIGNAL,
  NewMessageSignalPayload,
} from '../../signals';
import { executeWorkflow } from '../../util/executeWF';
import type * as activities from '../../activities';
import { logParsedEmailWorkflow } from './childWorkFlows/sampleChild.workflow';

const { parseEmailIntentActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
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

      const parsed = await parseEmailIntentActivity(threadId, messageId);

      // execute sub workflows based on the parsed intent
      switch (parsed.quantity) {
        case 1:
          return await executeWorkflow(logParsedEmailWorkflow, {
            args: [parsed],
            asChild: true,
            workflowId: `rfq-intent-${threadId}`,
          });
        default:
          throw new Error(`Unknown intent: ${parsed.quantity}`);
      }
    }

    await sleep('5s'); // avoid busy-looping
  }
}
