import { z } from 'zod';
import { BaseNodeOutputSchema } from '../base.schema';
import zodToJsonSchema from 'zod-to-json-schema';

export const extractRFQDetailsInputSchema = z.object({
  messages: z.array(z.string()),
  responseSchema: z.string(),
});

export const extractRFQDetailsOutputSchema = BaseNodeOutputSchema.extend({
  rfqNumber: z.string().nullable(), // we will generate this using RFQ number generator
  expectedDeliveryDate: z.string(),
  items: z
    .array(
      z.object({
        itemCode: z
          .string()
          .describe(
            'Item code is required but was not clearly identified from the message',
          ), // PN / SKU / NSN
        itemDescription: z.string().nullable(),
        quantity: z
          .number()
          .int({ message: 'Item quantity must be a number' })
          .nonnegative({
            message:
              'Item quantity identified in the message must be a non-negative integer',
          }),
        unit: z.string({
          message: 'Item unit could not be parsed from the message',
        }),
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
