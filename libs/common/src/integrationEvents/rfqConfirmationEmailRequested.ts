import { rfqConfirmationEmailRequestedSubject, TRfqConfirmationEmailRequestedPayload } from '../nats';
import {
  BaseIntegrationEvent,
  IntegrationEventMetadata,
  IntegrationEvent,
  TEventSources,
} from '../types/integrationEvents.type';

export class RfqConfirmationEmailRequested implements IntegrationEvent {
  constructor(data: TRfqConfirmationEmailRequestedPayload, source: TEventSources) {
    super(rfqConfirmationEmailRequestedSubject, data, source);
  }
} 