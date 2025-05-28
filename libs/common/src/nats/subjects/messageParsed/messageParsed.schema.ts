import { threadId } from 'worker_threads';
import { z } from 'zod';

export const messageParsedSubjectPayloadSchema = z.object({
  threadId: z.string(),
  messageId: z.string(),
  summary: z.string(),
  expectedDeliveryDate: z.string().nullable(),
  hasAttachments: z.boolean().nullable(),
  requiresHumanReview: z.boolean(),
  items: z
    .array(
      z.object({
        itemCode: z.string(),
        itemDescription: z.string().nullable(),
        quantity: z.number().int().positive(),
        unit: z.string().nullable(),
        notes: z.string().nullable(),
      }),
    )
    .min(1)
    .nullable(),
  customerDetail: z
    .object({
      name: z.string().nullable(),
      email: z.string(),
    })
    .nullable(),
  notes: z.string().nullable(),
});

export type TMessageParsedSubjectPayload = z.infer<
  typeof messageParsedSubjectPayloadSchema
>;
