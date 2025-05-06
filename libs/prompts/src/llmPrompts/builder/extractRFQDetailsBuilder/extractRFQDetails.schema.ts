import { z } from 'zod';

export const extractRFQDetailsInputSchema = z.object({
  messages: z.string().min(10),
  responseSchema: z.string(),
});

export const extractRFQDetailsOutputSchema = z.object({
  threadId: z.string().optional(),
  rfqNumber: z.string().optional(), // our internal RFQ number
  requestSummary: z.string(),

  expectedDeliveryDate: z.string().datetime().optional(), // ISO 8601
  hasAttachments: z.boolean(),

  items: z
    .array(
      z.object({
        itemCode: z.string(), // PN / SKU / NSN
        itemDescription: z.string().optional(),
        quantity: z.number().int().positive(),
        unit: z.string().optional(), // e.g. pcs, each, L
        notes: z.string().optional(), // delivery condition, packaging, etc.
      }),
    )
    .min(1),

  customerDetail: z.object({
    name: z.string().optional(),
    email: z.string(),
  }),
  notes: z.string().optional(), // catch-all for anything unstructured
});

export type TExtractRFQDetailsInput = z.infer<
  typeof extractRFQDetailsInputSchema
>;
export type TExtractRFQDetailsOutput = z.infer<
  typeof extractRFQDetailsOutputSchema
>;
