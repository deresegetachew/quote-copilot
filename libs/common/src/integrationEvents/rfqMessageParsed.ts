import { messageParsedSubject } from '../nats';
import {
  IntegrationEvent,
  TEventSources,
} from '../types/integrationEvents.type';

export type TRFQReceivedEvent = {
  rfqId: string;
  threadId: string;
  sender: string;
  requestSummary: string;
  itemsRequested: { itemCode: string; quantity: number; note: string }[];
};
export class RFQMessageParsed extends IntegrationEvent<TRFQReceivedEvent> {
  constructor(data, source: TEventSources) {
    super(messageParsedSubject, data, source);
  }
}
