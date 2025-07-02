import z from 'zod';
import { DateHelper } from '../utils/dateHelper';
import { TEvtTopic } from './topic.helper';
import { validateWithSchema } from '@schema-validation';

export abstract class IntegrationEvent {
  readonly id: string;
  readonly timestamp: string; // move to metadata in the future
  protected isRpc: boolean = false; // Default to false, can be overridden in subclasses

  constructor(
    protected readonly source: TEventSources,
    protected readonly evtTopic: TEvtTopic,
    protected readonly payloadSchema: z.ZodSchema,
    protected readonly data: z.infer<typeof payloadSchema>,
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
