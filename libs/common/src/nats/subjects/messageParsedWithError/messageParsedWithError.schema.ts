import { z } from 'zod';

export const messageParsedWithErrorSubjectPayloadSchema = z.object({
  threadId: z.string(),
  messageId: z.string(),
  summary: z.string(),
});

export type TMessageParsedWithErrorSubjectPayload = z.infer<
  typeof messageParsedWithErrorSubjectPayloadSchema
>;
