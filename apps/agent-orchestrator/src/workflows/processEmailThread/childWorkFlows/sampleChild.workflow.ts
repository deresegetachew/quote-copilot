import { proxyActivities, sleep } from '@temporalio/workflow';
import type * as activities from '../../../activities';

const { logInfo } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export async function logParsedEmailWorkflow(parsed: {
  threadId: string;
  partNumber: string;
  quantity: number;
}): Promise<void> {
  const state = {
    counter: 0,
  };

  // simulate steps
  for (let i = 0; i < 3; i++) {
    state.counter++;
    await sleep('3s'); // or do some activity
    await logInfo(`📥 Parsed Email Info:
        Thread ID: ${parsed.threadId}
        counter: ${state.counter}
  `);
  }
}
