import { EMAIL_ENUMS } from '@common';

export interface SendRfqConfirmationEmailInput {
  threadId: string;
  recipientEmail: string;
  customerName?: string;
  rfqSummary?: string;
  items?: Array<{
    itemCode?: string;
    itemDescription?: string | null;
    quantity?: number;
    unit?: string | null;
    notes?: string[] | null;
  }>;
  emailType: EMAIL_ENUMS.RFQ_NEW_CONFIRMATION | EMAIL_ENUMS.RFQ_FOLLOWUP_CONFIRMATION;
  originalSubject?: string;
  originalMessageId?: string;
  references?: string;
}

export abstract class EmailConfirmationPort {
  abstract sendRfqConfirmationEmail(
    input: SendRfqConfirmationEmailInput,
  ): Promise<void>;
} 