import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { BaseNodeOutputSchema } from '../base.schema';

export const summarizeEmailInputSchema = z.object({
  messages: z.array(z.string()),
  responseSchema: z.string(),
});

export const summarizeEmailOutputSchema = BaseNodeOutputSchema.extend({
  summary: z.string(),
});

const jsonSchema = zodToJsonSchema(
  summarizeEmailOutputSchema,
  'summarizeEmailOutputSchema',
);

export const summarizeEmailOutputSchemaTxt = `\`\`\`json
${JSON.stringify(jsonSchema.definitions?.summarizeEmailOutputSchema || jsonSchema, null, 2)}
\`\`\``;

export type TSummarizeMessageInput = z.infer<typeof summarizeEmailInputSchema>;
export type TSummarizeMessageOutput = z.infer<
  typeof summarizeEmailOutputSchema
>;
