import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const emailIntentResponseSchema = z
  .object({
    threadId: z.string(),
    requestSummary: z.string().nonempty(),
    isRFQ: z.boolean(),
    expectedDeliveryDate: z.string().nullable(),
    hasAttachments: z.boolean(),
    items: z
      .array(
        z.object({
          itemCode: z.string(),
          itemDescription: z.string().nullable(),
          quantity: z.number().int().positive(),
          notes: z.string().optional(),
        }),
      )
      .nullable(),
    customerDetail: z.object({
      customerId: z.string().nullable(),
      name: z.string().nullable(),
      email: z.string(),
    }),
    notes: z.string().nullable(),
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
