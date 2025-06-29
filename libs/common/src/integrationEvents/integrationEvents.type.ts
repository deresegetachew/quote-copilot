import z from 'zod';
import { DateHelper } from '../utils/dateHelper';
import { buildTopic, TEvtTopic } from './topic.helper';
import { validateWithSchema } from '@schema-validation';

export abstract class IntegrationEvent {
  readonly id: string;
  readonly evtTopic: string;
  private readonly payloadSchema: z.ZodSchema;
  readonly data: z.infer<typeof this.payloadSchema>;
  readonly source: string;
  readonly timestamp: string; // move to metadata in the future

  constructor(
    source: TEventSources,
    evtTopic: TEvtTopic,
    payloadSchema: z.ZodSchema,
    payload: z.infer<typeof payloadSchema>,
  ) {
    this.id = crypto.randomUUID();
    this.source = source;
    this.evtTopic = buildTopic(evtTopic);
    this.data = payload;
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
  | 'document-worker';
