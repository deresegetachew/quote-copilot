import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';
import { BaseNodeOutputSchema } from '../base.schema';

export const classifyMessageAsRFQInputSchema = z.object({
  messages: z.array(z.string()),
  responseSchema: z.string(),
});

export const classifyMessageAsRFQOutputSchema = BaseNodeOutputSchema.extend({
  isRFQ: z.boolean(),
  reason: z.string().optional(),
});

const ClassifyMessageAsRFQOutputJSONSchema = zodToJsonSchema(
  classifyMessageAsRFQOutputSchema,
  'classifyMessageAsRFQOutputSchema',
);

export const classifyMessageAsRFQOutputSchemaTxt = `\`\`\`json
${JSON.stringify(
  ClassifyMessageAsRFQOutputJSONSchema.definitions
    ?.classifyMessageAsRFQOutputSchema || ClassifyMessageAsRFQOutputJSONSchema,
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
