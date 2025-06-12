import { Command } from '@nestjs/cqrs';
import { z } from 'zod';

// Schema for validating the trigger email thread processing workflow command
export const TriggerEmailThreadProcessingWfCommandSchema = z.object({
  threadId: z.string().min(1, 'Thread ID is required'),
  messageId: z.string().min(1, 'Message ID is required'),
});

type TriggerEmailThreadProcessingWfCommandSchemaType = z.infer<
  typeof TriggerEmailThreadProcessingWfCommandSchema
>;

export class TriggerEmailThreadProcessingWfCommand extends Command<void> {
  constructor(
    public readonly threadId: string,
    public readonly messageId: string,
  ) {
    super();
  }
}
