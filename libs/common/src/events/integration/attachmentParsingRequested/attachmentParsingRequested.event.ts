import { threadId } from 'worker_threads';
import z from 'zod';
import { IntegrationEvent, TEventSources } from '../../integrationEvents.type';
import { buildTopic, parseTopic, TEvtTopic } from '../../topic.helper';

const PayloadSchema = z.object({
  threadId: z.string(),
});

const evtTopic: TEvtTopic = {
  subject: 'email',
  topic: 'attachment-parsing-requested',
};

export class AttachmentParsingRequestedEvt extends IntegrationEvent {
  static readonly EvtTopicKey = buildTopic(evtTopic);

  constructor(source: TEventSources, payload: z.infer<typeof PayloadSchema>) {
    super(source, evtTopic, PayloadSchema, payload);
  }
}
