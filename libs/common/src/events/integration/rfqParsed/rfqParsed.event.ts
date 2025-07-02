import z from 'zod';
import { IntegrationEvent, TEventSources } from '../../integrationEvents.type';
import { buildTopic, TEvtTopic } from '../../topic.helper';

const PayloadSchema = z.object({
  rfqId: z.string(),
});

const evtTopic: TEvtTopic = {
  subject: 'email',
  topic: 'rfq-parsed',
};

export class RFQParsedIntegrationEvt extends IntegrationEvent {
  static readonly EvtTopicKey = buildTopic(evtTopic);

  constructor(source: TEventSources, payload: z.infer<typeof PayloadSchema>) {
    super(source, evtTopic, PayloadSchema, payload);
  }
}
