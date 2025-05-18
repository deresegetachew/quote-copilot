import { z } from 'zod';
import { BaseNodeOutputSchema } from '../base.schema';

export const extractRFQDetailsInputSchema = z.object({
  messages: z.array(z.string()),
  responseSchema: z.string(),
});

export const extractRFQDetailsOutputSchema = BaseNodeOutputSchema.extend({
  threadId: z.string(),
  rfqNumber: z.string().nullable(), // we will generate this using RFQ number generator

  expectedDeliveryDate: z.string().datetime().nullable(), // ISO 8601
  hasAttachments: z.boolean(),

  items: z
    .array(
      z.object({
        itemCode: z.string(), // PN / SKU / NSN
        itemDescription: z.string().nullable(),
        quantity: z.number().int().positive(),
        unit: z.string().nullable(), // e.g. pcs, each, L
        notes: z.string().nullable(), // delivery condition, packaging, etc.
      }),
    )
    .min(1),

  customerDetail: z.object({
    name: z.string().nullable(),
    email: z.string(),
  }),
  notes: z.string().nullable(), // catch-all for anything unstructured
});

export type TExtractRFQDetailsInput = z.infer<
  typeof extractRFQDetailsInputSchema
>;
export type TExtractRFQDetailsOutput = z.infer<
  typeof extractRFQDetailsOutputSchema
>;
