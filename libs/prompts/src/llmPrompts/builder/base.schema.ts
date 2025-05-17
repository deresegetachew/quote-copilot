import { z } from 'zod';

export const BaseNodeOutputSchema = z.object({
  error: z.string().optional(),
});
export type TBaseNodeOutput = z.infer<typeof BaseNodeOutputSchema>;
