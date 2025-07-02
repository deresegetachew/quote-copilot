import z from 'zod';
import { IntegrationEvent, TEventSources } from '../../integrationEvents.type';

const PayloadSchema = z.object({
  threadId: z.string(),
  messageId: z.string(),
  attachmentId: z.string(),
});

export class ParseAttachmentRPC extends IntegrationEvent {
  isRpc = true; // Set the RPC flag to true

  constructor(source: TEventSources, payload: z.infer<typeof PayloadSchema>) {
    super(
      source,
      {
        subject: 'email',
        topic: 'parse-attachment',
      },
      PayloadSchema,
      payload,
    );
  }
}
