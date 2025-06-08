import { DateHelper } from '../utils/dateHelper';

export abstract class IntegrationEvent<T = any> {
  readonly source: string;
  readonly id: string;
  readonly timestamp: string; // move to metadata in the future
  readonly eventType: string;
  readonly data: T;

  constructor(source: TEventSources, eventType: string, data: T) {
    this.id = crypto.randomUUID();
    this.source = source;
    this.eventType = eventType;
    this.data = data;
    this.timestamp = DateHelper.getNowAsString();
  }
}

export type TEventSources =
  | 'agent-orchestrator'
  | 'email-worker'
  | 'telegram-worker'
  | 'whatsapp-worker'
  | 'document-worker';
