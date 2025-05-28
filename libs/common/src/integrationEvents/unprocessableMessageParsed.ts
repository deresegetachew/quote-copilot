import { messageParsedUnprocessableSubject } from '../nats';
import {
  IntegrationEvent,
  TEventSources,
} from '../types/integrationEvents.type';

export type TUnprocessableMessageParsedEvent = {
  threadId: string;
  messageId: string;
  sender: string;
};

export class UnprocessableMessageParsed extends IntegrationEvent<TUnprocessableMessageParsedEvent> {
  constructor(data, source: TEventSources) {
    super(messageParsedUnprocessableSubject, data, source);
  }
}
