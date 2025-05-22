import { proxyActivities, setHandler, sleep } from '@temporalio/workflow';
import type * as activities from '../../activities';
import { WorkflowClient } from '@temporalio/client';
import { TASK_QUEUES, WORKFLOW_SIGNALS } from '../../../../../libs/common/src';
import { NEW_MESSAGE_SIGNAL } from '../../signals';

const { getUnreadEmailsActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
  retry: {
    maximumAttempts: 3,
    initialInterval: '5s',
    backoffCoefficient: 2,
    maximumInterval: '10s',
  },
});

export async function getUnreadEmailsWorkflow(): Promise<void> {
  setHandler(NEW_MESSAGE_SIGNAL, () => {
    console.log('Run unread emails workflow');
  });

  while (true) {
    await getUnreadEmailsActivity();

    await sleep('1m'); // avoid busy-looping
  }
}

export async function startUnreadEmailsWorkFlow(client: WorkflowClient) {
  console.log('Starting up getUnreadEmailsWorkflow...');
  const workflowId = 'get-unread-emails-workflow';
  const taskQueue = TASK_QUEUES.EMAIL_TASKS_AGENT_ORCHESTRATOR;

  try {
    await client.signalWithStart(getUnreadEmailsWorkflow, {
      taskQueue,
      workflowId,
      args: [],
      signal: WORKFLOW_SIGNALS.NEW_MESSAGE,
      signalArgs: [],
    });
    console.log('✅ getUnreadEmailsWorkflow started');
  } catch (err: any) {
    if (err.name === 'WorkflowExecutionAlreadyStartedError') {
      console.warn('⚠️ getUnreadEmailsWorkflow already running');
    } else {
      console.error('❌ Failed to start getUnreadEmailsWorkflow:', err);
    }
  }
}
