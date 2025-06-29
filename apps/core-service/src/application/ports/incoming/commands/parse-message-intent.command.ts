import { Command } from '@nestjs/cqrs';
import { z } from 'zod';
import { TEmailIntentResponseDTO } from '@common';

// Schema for validating the parse message intent command payload
export const ParseMessageIntentCommandSchema = z.object({
  threadId: z.string().min(1, 'Thread ID is required'),
  messageId: z.string().min(1, 'Message ID is required'),
});

type ParseMessageIntentCommandSchemaType = z.infer<
  typeof ParseMessageIntentCommandSchema
>;

export class ParseMessageIntentCommand extends Command<TEmailIntentResponseDTO> {
  constructor(
    public readonly payload: z.infer<typeof ParseMessageIntentCommandSchema>,
  ) {
    super();
  }
}
