import { z } from 'zod';

export enum ValidationType {
  HTTP_BODY = 'http request body',
  HTTP_QUERY = 'http query parameters',
  HTTP_PARAM = 'http route parameters',
  USECASE_COMMAND = 'command',
  USECASE_QUERY = 'query',
  EVENT_PAYLOAD = 'event-payload',
}

export interface ValidationOptions {
  errorMessage?: string;
  transform?: boolean;
  stripUnknown?: boolean;
}

export interface ValidationMetadata {
  schema: z.ZodSchema<any>;
  options?: ValidationOptions;
  type: ValidationType;
}

export const VALIDATION_METADATA = 'validation:metadata';
