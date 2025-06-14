import { z } from 'zod';

// Param schema for threadId in getEmailThreadMessages endpoint
export const GetEmailThreadMessagesParamSchema = z
  .object({
    storageThreadID: z.string().min(1, 'storageThreadID ID is required'),
  })
  .strict();

export type TGetEmailThreadMessagesParam = z.infer<
  typeof GetEmailThreadMessagesParamSchema
>;
