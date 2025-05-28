import { z } from 'zod';
import { BaseNodeOutputSchema } from '../base.schema';
import zodToJsonSchema from 'zod-to-json-schema';

export const extractRFQDetailsInputSchema = z.object({
  messages: z.array(z.string()),
  responseSchema: z.string(),
});

export const extractRFQDetailsOutputSchema = BaseNodeOutputSchema.extend({
  rfqNumber: z.string().nullable(), // we will generate this using RFQ number generator
  expectedDeliveryDate: z.string().nullable(),
  items: z
    .array(
      z.object({
        itemCode: z.string(), // PN / SKU / NSN
        itemDescription: z.string().nullable(),
        quantity: z.number().int().nonnegative(),
        unit: z.string().nullable(), // e.g. pcs, each, L
        notes: z.array(z.string()).nullable(), // delivery condition, packaging, etc.
      }),
    )
    .min(1),

  customerDetail: z.object({
    name: z.string().nullable(),
  }),
  notes: z.array(z.string()).nullable(), // catch-all for anything unstructured
});

export type TExtractRFQDetailsInput = z.infer<
  typeof extractRFQDetailsInputSchema
>;
export type TExtractRFQDetailsOutput = z.infer<
  typeof extractRFQDetailsOutputSchema
>;

const extractRFQDetailsOutputJSONSchema = zodToJsonSchema(
  extractRFQDetailsOutputSchema,
  'extractRFQDetailsOutputSchema',
);

export const extractRFQDetailsOutputSchemaTxt = `\`\`\`json
${JSON.stringify(
  extractRFQDetailsOutputJSONSchema.definitions
    ?.extractRFQDetailsOutputSchema || extractRFQDetailsOutputJSONSchema,
  null,
  2,
)}
\`\`\``;
