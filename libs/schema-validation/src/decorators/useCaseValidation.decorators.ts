import { z } from 'zod';
import { ValidationOptions, ValidationType } from '../interfaces';
import { createValidationDecorator } from './decorator.utils';

/**
 * Validates command input for CQRS commands using Zod schema
 * @param schema - Zod schema for validation
 * @param options - Additional validation options
 */
export function ValidateCommandSchema<T>(
  schema: z.ZodSchema<T>,
  options?: ValidationOptions,
) {
  return createValidationDecorator(
    schema,
    ValidationType.USECASE_COMMAND,
    {},
    options,
  ) as ClassDecorator;
}

/**
 * Validates query input for CQRS queries using Zod schema
 * @param schema - Zod schema for validation
 * @param options - Additional validation options
 */
export function ValidateQuerySchema<T>(
  schema: z.ZodSchema<T>,
  options?: ValidationOptions,
) {
  return createValidationDecorator(
    schema,
    ValidationType.USECASE_QUERY,
    {},
    options,
  ) as ClassDecorator;
}
