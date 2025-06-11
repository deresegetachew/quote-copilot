import { z } from 'zod';
import { SchemaValidationException } from '../exceptions';

/**
 * Validates data against a Zod schema and returns the result, or throws SchemaValidationException on error
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string = 'validation',
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new SchemaValidationException(result.error, context);
  }
  return result.data;
}

/**
 * Validates data against a Zod schema and returns a result object (success/data or errors)
 */
export function safeValidateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
