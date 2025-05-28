import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const EmailIntentSchema = z.object({
  threadId: z.string(),
  messages: z.array(z.string()),
  requestSummary: z.string().nonempty().nullable(),
  isRFQ: z.boolean().nullable(),
  reason: z.string().nullable(),
  expectedDeliveryDate: z.string().nullable(),
  hasAttachments: z.boolean().nullable(),
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
      email: z.string().nullable(),
    })
    .nullable(),
  notes: z.array(z.string()).nullable(),
  error: z
    .object({
      message: z.string(),
      obj: z.any(),
    })
    .nullable(),
});

const jsonSchema = zodToJsonSchema(
  EmailIntentSchema,
  'emailIntentRFQResponseSchema',
);

export const emailIntentRFQResponseSchemaTxt = `\`\`\`json
${JSON.stringify(jsonSchema.definitions?.emailIntentRFQResponseSchema || jsonSchema, null, 2)}
\`\`\``;

export type TEmailIntentSchemaType = z.infer<typeof EmailIntentSchema>;
