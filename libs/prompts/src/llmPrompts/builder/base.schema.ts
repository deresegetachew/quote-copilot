import { z } from 'zod';

export const BaseNodeOutputSchema = z.object({
  error: z.optional(z.any()),
});
export type TBaseNodeOutput = z.infer<typeof BaseNodeOutputSchema>;
