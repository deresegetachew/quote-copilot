import z from 'zod';
import { DateHelper } from '../utils/dateHelper';
import { TEvtTopic } from './topic.helper';
import { validateWithSchema } from '@schema-validation';

export abstract class IntegrationEvent {
  readonly id: string;
  readonly timestamp: string; // move to metadata in the future
  protected isRpc: boolean = false; // Default to false, can be overridden in subclasses

  constructor(
    public readonly source: TEventSources,
    public readonly evtTopic: TEvtTopic,
    public readonly payloadSchema: z.ZodSchema,
    public readonly data: z.infer<typeof payloadSchema>,
  ) {
    this.id = crypto.randomUUID();
    this.timestamp = DateHelper.getNowAsString();
  }

  validateEvt() {
    validateWithSchema(this.payloadSchema, this.data);
  }
}

export type TEventSources =
  | 'agent-orchestrator'
  | 'email-worker'
  | 'telegram-worker'
  | 'whatsapp-worker'
  | 'document-worker'
  | 'core-service';
