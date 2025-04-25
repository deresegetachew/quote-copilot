import { EMAIL_ENUMS } from '@common';

type SendEmailInput = {
  email: EMAIL_ENUMS;
  threadId: string;
  inReplyToMessageId: string;
};
export const sendEmailActivity = async (
  prop: SendEmailInput,
): Promise<void> => {
  // TODO for Ab: Fire an integration event to send an email
  // and email sending should be handled in our core business application since the email client is already implmented
  // plus we should keep this agent-orchestrator light wait

  console.log(`Fired Send Email Activity  for ${{ prop }}`);
};
