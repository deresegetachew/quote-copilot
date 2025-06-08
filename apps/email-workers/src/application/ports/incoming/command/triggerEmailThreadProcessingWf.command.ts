import { z } from 'zod';

// Schema for validating the trigger email thread processing workflow command
export const TriggerEmailThreadProcessingWfCommandSchema = z.object({
  threadId: z.string().min(1, 'Thread ID is required'),
  messageId: z.string().min(1, 'Message ID is required'),
});

export class TriggerEmailThreadProcessingWfCommand {
  constructor(
    public readonly threadId: z.infer<
      typeof TriggerEmailThreadProcessingWfCommandSchema
    >['threadId'],
    public readonly messageId: z.infer<
      typeof TriggerEmailThreadProcessingWfCommandSchema
    >['messageId'],
  ) {
    this.threadId = threadId;
    this.messageId = messageId;
  }
}
