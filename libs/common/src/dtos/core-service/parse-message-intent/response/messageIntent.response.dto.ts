import { AttachmentParsingStatus } from '../../../../valueObjects';
import { z } from 'zod';

// Zod schema for TMessageIntentResponseDTO
export const MessageIntentResponseDTOSchema = z
  .object({
    threadId: z.string().min(1, 'Thread ID is required'),
    summary: z.string().min(1, 'Summary is required'),
    isRFQ: z.boolean().nullable(),
    reason: z.string().nullable(),
    error: z.array(z.string()).nullable(),
    rfqData: z.object({
      customerDetail: z
        .object({
          name: z.string().nullable(),
          email: z.string().email('Invalid email address'),
        })
        .nullable(),
      expectedDeliveryDate: z.string().nullable(),
      hasAttachments: z.boolean().nullable(),
      notes: z.array(z.string()).nullable(),
      items: z
        .array(
          z.object({
            itemCode: z.string().min(1, 'Item code is required'),
            itemDescription: z.string().nullable(),
            quantity: z.number().positive('Quantity must be positive'),
            unit: z.string().nullable(),
            notes: z.array(z.string()).nullable(),
          }),
        )
        .nullable(),
    }),
  })
  .strict();

export type TMessageIntentResponseDTO = z.infer<
  typeof MessageIntentResponseDTOSchema
>;
