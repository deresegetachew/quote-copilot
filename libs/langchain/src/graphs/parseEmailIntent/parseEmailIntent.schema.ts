import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const emailIntentResponseSchema = z
  .object({
    threadId: z.string(),
    requestSummary: z.string().nonempty(),
    isRFQ: z.boolean(),
    expectedDeliveryDate: z.string().datetime().optional(),
    hasAttachments: z.boolean(),
    items: z
      .array(
        z.object({
          itemCode: z.string(),
          itemDescription: z.string().optional(),
          quantity: z.number().int().positive(),
          notes: z.string().optional(),
        }),
      )
      .optional(),
    customerDetail: z.object({
      customerId: z.string().optional(),
      name: z.string().optional(),
      email: z.string(),
    }),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.isRFQ) {
        return (
          Array.isArray(data.items) &&
          data.items.length > 0 &&
          typeof data.expectedDeliveryDate === 'string'
        );
      }
      return true; // valid if it's not an RFQ
    },
    {
      message: 'Items and expected DeliveryDate are required if isRFQ is true',
      path: ['items', 'expectedDeliveryDate'], // highlights this in error reporting
    },
  );

const jsonSchema = zodToJsonSchema(
  emailIntentResponseSchema,
  'emailIntentRFQResponseSchema',
);

export const emailIntentRFQResponseSchemaTxt = `\`\`\`json
${JSON.stringify(jsonSchema.definitions?.emailIntentRFQResponseSchema || jsonSchema, null, 2)}
\`\`\``;

export type TEmailIntentRFQResponseSchemaType = z.infer<
  typeof emailIntentResponseSchema
>;
