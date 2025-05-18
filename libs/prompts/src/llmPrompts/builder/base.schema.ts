import { z } from 'zod';

export const BaseNodeOutputSchema = z.object({
  error: z.string().nullable(),
});
export type TBaseNodeOutput = z.infer<typeof BaseNodeOutputSchema>;
