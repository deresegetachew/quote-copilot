import { rfqConfirmationEmailRequestedSubject, TRfqConfirmationEmailRequestedPayload } from '../nats';
import {
  BaseIntegrationEvent,
  IntegrationEventMetadata,
  IntegrationEvent,
  TEventSources,
} from '../types/integrationEvents.type';

export class RfqConfirmationEmailRequested implements IntegrationEvent {
  timestamp: Date;
  source: string;
  version: string;
  metadata: IntegrationEventMetadata;
  payload: TRfqConfirmationEmailRequestedPayload;

  constructor(data: TRfqConfirmationEmailRequestedPayload, source: TEventSources) {
    this.timestamp = new Date();
    this.source = source;
    this.version = '1.0.0';
    this.metadata = {
      eventId: `rfq-confirmation-${Date.now()}`,
    };
    this.payload = data;
  }
} 