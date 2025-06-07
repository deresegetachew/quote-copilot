import { DateHelper } from '../utils/dateHelper';

export abstract class IntegrationEvent<T = any> {
  readonly source: string;
  readonly timestamp: string;
  readonly eventType: string;
  readonly data: T;

  constructor(source: TEventSources, eventType: string, data: T) {
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
  | 'whatsapp-worker';
