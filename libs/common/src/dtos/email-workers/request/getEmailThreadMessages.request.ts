import { z } from 'zod';

// Param schema for threadId in getEmailThreadMessages endpoint
export const GetEmailThreadMessagesParamSchema = z
  .object({
    threadId: z.string().min(1, 'Thread ID is required'),
  })
  .strict();

export type TGetEmailThreadMessagesParam = z.infer<
  typeof GetEmailThreadMessagesParamSchema
>;
