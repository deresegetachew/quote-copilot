import { z } from 'zod';

export const messageParsedUnprocessableSubjectPayloadSchema = z.object({
  threadId: z.string(),
  messageId: z.string(),
  summary: z.string(),
});

export type TMessageParsedUnprocessableSubjectPayload = z.infer<
  typeof messageParsedUnprocessableSubjectPayloadSchema
>;
