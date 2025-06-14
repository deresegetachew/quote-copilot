import { z } from 'zod';

export const rfqConfirmationEmailRequestedSchema = z.object({
  threadId: z.string(),
  rfqId: z.string(),
  recipientEmail: z.string(),
  customerName: z.string().nullable(),
  rfqSummary: z.string().nullable(),
  items: z.array(z.object({
    itemCode: z.string(),
    itemDescription: z.string().nullable(),
    quantity: z.number(),
    unit: z.string().nullable(),
    notes: z.array(z.string()).nullable(),
  })).nullable(),
  emailType: z.enum(['RFQ_NEW_CONFIRMATION', 'RFQ_FOLLOWUP_CONFIRMATION']),
  originalSubject: z.string().nullable(),
  originalMessageId: z.string().nullable(),
  references: z.string().nullable(),
});

export type TRfqConfirmationEmailRequestedPayload = z.infer<typeof rfqConfirmationEmailRequestedSchema>; 