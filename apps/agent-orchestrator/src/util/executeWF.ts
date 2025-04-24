import {
  executeChild,
  isCancellation,
  WorkflowInfo,
  workflowInfo,
} from '@temporalio/workflow';

interface ExecuteWorkflowOptions<TArgs extends any[]> {
  args: TArgs;
  asChild?: boolean;
  workflowId?: string;
  retry?: {
    initialInterval?: string;
    maximumAttempts?: number;
  };
  logger?: (msg: string) => void;
}

export async function executeWorkflow<TArgs extends any[], TResult>(
  workflowFn: (...args: TArgs) => Promise<TResult>,
  options: ExecuteWorkflowOptions<TArgs>,
): Promise<TResult> {
  const {
    args,
    asChild = false,
    workflowId,
    retry,
    logger = (msg) => console.log(`[WorkflowHelper] ${msg}`),
  } = options;

  const info: WorkflowInfo = workflowInfo();
  const resolvedWorkflowId =
    workflowId ?? `${info.workflowId}-${workflowFn.name}-${Date.now()}`;

  try {
    if (asChild) {
      logger(
        `🚀 Executing child workflow [${workflowFn.name}] with ID: ${resolvedWorkflowId}`,
      );

      return await executeChild<typeof workflowFn>(workflowFn, {
        args,
        workflowId: resolvedWorkflowId,
        retryPolicy: retry
          ? {
              initialInterval: retry.initialInterval ?? '3s',
              maximumAttempts: retry.maximumAttempts ?? 3,
            }
          : undefined,
      });
    }

    logger(`⚙️ Executing inline workflow function [${workflowFn.name}]`);
    return await workflowFn(...args);
  } catch (err: any) {
    if (isCancellation(err)) {
      logger(`⚠️ Workflow [${workflowFn.name}] was cancelled.`);
    } else {
      logger(`❌ Error in workflow [${workflowFn.name}]: ${err.message}`);
    }
    throw err;
  }
}
