import { z } from 'zod';

// Schema for validating the parse message intent command payload
export const ParseMessageIntentCommandSchema = z.object({
  threadId: z.string().min(1, 'Thread ID is required'),
  messageId: z.string().min(1, 'Message ID is required'),
});

export class ParseMessageIntentCommand {
  constructor(
    public readonly payload: z.infer<typeof ParseMessageIntentCommandSchema>,
  ) {}
}
