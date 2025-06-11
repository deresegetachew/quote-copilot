import { z } from 'zod';

export const ParseMessageIntentBodySchema = z
  .object({
    threadId: z.string().min(1, 'threadId is required'),
    messageId: z.string().min(1, 'messageId is required'),
  })
  .strict();

export type TParseMessageIntentBody = z.infer<
  typeof ParseMessageIntentBodySchema
>;
