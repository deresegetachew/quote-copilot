import {
  IntegrationEvent,
  TEventSources,
} from '../types/integrationEvents.type';

export const RFQ_RECEIVED_EVENT_KEY = 'rfq.received';
export type TRFQReceivedEvent = {
  rfqId: string;
  threadId: string;
  sender: string;
  requestSummary: string;
  itemsRequested: { itemCode: string; quantity: number; note: string }[];
};
export class RFQReceivedEvent extends IntegrationEvent<TRFQReceivedEvent> {
  constructor(data, source: TEventSources) {
    super(RFQ_RECEIVED_EVENT_KEY, data, source);
  }
}
