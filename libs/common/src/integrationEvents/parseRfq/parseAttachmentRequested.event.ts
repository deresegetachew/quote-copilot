import { EvtAttachmentParseRequested } from '../eventConstants';
import { IntegrationEvent, TEventSources } from '../integrationEvents.type';

interface TEventPayload {
  threadId: string;
  messageId: string;
  attachmentId: string;
}

export class ParseAttachmentRequestedEvent extends IntegrationEvent<TEventPayload> {
  constructor(source: TEventSources, data: TEventPayload) {
    super(source, EvtAttachmentParseRequested, data);
  }
}
