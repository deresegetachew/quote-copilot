import { z } from 'zod';
import { ValidationOptions, ValidationType } from '../interfaces';
import { createValidationDecorator } from './decorator.utils';

/**
 * Validates event payload for event-driven architecture using Zod schema
 * @param schema - Zod schema for validation
 * @param options - Additional validation options
 */
export function ValidateEventPayloadSchema<T>(
  schema: z.ZodSchema<T>,
  options?: ValidationOptions,
) {
  return createValidationDecorator(
    schema,
    ValidationType.EVENT_PAYLOAD,
    {},
    options,
  );
}
