import { rfqConfirmationEmailRequestedSubject, TRfqConfirmationEmailRequestedPayload } from '../nats';
import {
  IntegrationEvent,
  TEventSources,
} from '../types/integrationEvents.type';

export class RfqConfirmationEmailRequested extends IntegrationEvent<TRfqConfirmationEmailRequestedPayload> {
  constructor(data: TRfqConfirmationEmailRequestedPayload, source: TEventSources) {
    super(rfqConfirmationEmailRequestedSubject, data, source);
  }
} 