import { Command } from '@nestjs/cqrs';
import { z } from 'zod';
import { RFQAggregate } from '../../../../domain/entities/RFQ.aggregate';

// Schema for validating the send confirmation message command payload
export const SendConfirmationMessageCommandSchema = z.object({
  threadId: z.string().min(1, 'Thread ID is required'),
  rfq: z.instanceof(RFQAggregate),
});

type SendConfirmationMessageCommandSchemaType = z.infer<
  typeof SendConfirmationMessageCommandSchema
>;

export class SendConfirmationMessageCommand extends Command<void> {
  constructor(
    public readonly threadId: string,
    public readonly rfq: RFQAggregate,
  ) {
    super();
  }
}
