export { processEmailThreadWorkflow } from './processEmailThread/processEmailThread.workflow';

export {
  getUnreadEmailsWorkflow,
  startUnreadEmailsWorkFlow,
} from './getUnreadEmails/getUnreadEmails.workflow';

// child workflows
export { logParsedEmailWorkflow } from './processEmailThread/childWorkFlows/sampleChild.workflow';
