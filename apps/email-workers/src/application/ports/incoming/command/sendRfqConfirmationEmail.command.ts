export class SendRfqConfirmationEmailCommand {
  constructor(
    public readonly threadId: string,
    public readonly recipientEmail: string,
    public readonly customerName: string | null,
    public readonly rfqSummary: string | null,
    public readonly items: Array<{
      itemCode: string;
      itemDescription: string | null;
      quantity: number;
      unit: string | null;
      notes: string[] | null;
    }> | null,
    public readonly emailType: 'RFQ_NEW_CONFIRMATION' | 'RFQ_FOLLOWUP_CONFIRMATION',
    public readonly originalSubject: string | null,
    public readonly originalMessageId: string | null,
    public readonly references: string | null,
  ) {}
} 