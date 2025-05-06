import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

export const classifyMessageAsRFQInputSchema = z.object({
  messages: z.array(z.string()),
  responseSchema: z.string(),
});

export const classifyMessageAsRFQOutputSchema = z.object({
  isRFQ: z.boolean(),
  reason: z.string().optional(),
});

const jsonSchema = zodToJsonSchema(
  classifyMessageAsRFQOutputSchema,
  'classifyMessageAsRFQOutputSchema',
);

export const classifyMessageAsRFQOutputSchemaTxt = `\`\`\`json
${JSON.stringify(
  jsonSchema.definitions?.classifyMessageAsRFQOutputSchema || jsonSchema,
  null,
  2,
)}
\`\`\``;

export type TClassifyMessageAsRFQInput = z.infer<
  typeof classifyMessageAsRFQInputSchema
>;
export type TClassifyMessageAsRFQOutput = z.infer<
  typeof classifyMessageAsRFQOutputSchema
>;
