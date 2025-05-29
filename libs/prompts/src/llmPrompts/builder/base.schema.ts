import { z } from 'zod';

export const BaseNodeOutputSchema = z.object({
  error: z.array(z.string()).nullable(),
});
export type TBaseNodeOutput = z.infer<typeof BaseNodeOutputSchema>;
