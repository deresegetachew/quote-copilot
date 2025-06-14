export interface BaseIntegrationEvent {
  timestamp: Date;
  source: string;
  version: string;
}

export interface IntegrationEventMetadata {
  eventId: string;
  correlationId?: string;
  causationId?: string;
  userId?: string;
  sessionId?: string;
}

export interface IntegrationEvent extends BaseIntegrationEvent {
  metadata: IntegrationEventMetadata;
  payload: any;
}

export type TEventSources = 
  | 'core-service'
  | 'email-workers'
  | 'agent-orchestrator'
  | 'telegram-workers'
  | 'whatsapp-workers'; 