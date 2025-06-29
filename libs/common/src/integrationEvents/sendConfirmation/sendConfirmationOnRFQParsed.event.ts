import z from 'zod';
import { IntegrationEvent, TEventSources } from '../integrationEvents.type';

const PayloadSchema = z.object({
  rfqId: z.string(),
});

export class sendConfirmationOnRFQParsedEvent extends IntegrationEvent {
  constructor(source: TEventSources, payload: z.infer<typeof PayloadSchema>) {
    super(
      source,
      {
        subject: 'email',
        topic: 'send-rfq-received-confirmation',
      },
      PayloadSchema,
      payload,
    );
  }
}
