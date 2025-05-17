import { DateHelper } from '../utils/dateHelper';

export abstract class IntegrationEvent<T = any> {
  readonly source: string;
  readonly timestamp: string;
  readonly eventType: string;
  readonly data: T;

  constructor(eventType: string, data: T, source: TApps) {
    this.eventType = eventType;
    this.data = data;
    this.source = source;
    this.timestamp = DateHelper.getNow();
  }
}

export type TApps =
  | 'agent-orchestrator'
  | 'email-worker'
  | 'telegram-worker'
  | 'whatsapp-worker';
