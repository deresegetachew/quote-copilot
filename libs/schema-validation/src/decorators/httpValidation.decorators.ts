import { z } from 'zod';
import { ValidationOptions, ValidationType } from '../interfaces';
import { createValidationDecorator } from './decorator.utils';

/**
 * Validates HTTP request body using Zod schema
 * @param schema - Zod schema for validation
 * @param options - Additional validation options
 */
export function ValidateBodySchema<T>(
  schema: z.ZodSchema<T>,
  options?: ValidationOptions,
) {
  return createValidationDecorator(
    schema,
    ValidationType.HTTP_BODY,
    {},
    options,
  );
}

/**
 * Validates HTTP query parameters using Zod schema
 * @param schema - Zod schema for validation
 * @param options - Additional validation options
 */
export function ValidateQueryParamSchema<T>(
  schema: z.ZodSchema<T>,
  options?: ValidationOptions,
) {
  return createValidationDecorator(
    schema,
    ValidationType.HTTP_QUERY,
    {},
    options,
  );
}

/**
 * Validates HTTP route parameters using Zod schema
 * @param schema - Zod schema for validation
 * @param options - Additional validation options
 */
export function ValidateParamSchema<T>(
  schema: z.ZodSchema<T>,
  options?: ValidationOptions,
) {
  return createValidationDecorator(
    schema,
    ValidationType.HTTP_PARAM,
    { stripUnknown: false }, // Usually don't strip params
    options,
  );
}

/**
 * General schema validation decorator
 * @param schema - Zod schema for validation
 * @param options - Additional validation options
 */
export function ValidateSchema<T>(
  schema: z.ZodSchema<T>,
  options?: ValidationOptions,
) {
  return createValidationDecorator(
    schema,
    ValidationType.HTTP_BODY,
    {},
    options,
  );
}
