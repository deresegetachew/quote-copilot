import { z } from 'zod';

/**
 * Validates data against a Zod schema and returns the result
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param options - Validation options
 * @returns Validated and potentially transformed data
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  options?: {
    transform?: boolean;
    stripUnknown?: boolean;
    errorMessage?: string;
  },
): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errorMessage = options?.errorMessage || 'Validation failed';
    throw new Error(`${errorMessage}: ${result.error.message}`);
  }
  
  return result.data;
}

/**
 * Validates data and returns success status with data or errors
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success status and data or errors
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

/**
 * Creates a validation function for a specific schema
 * @param schema - Zod schema to create validator for
 * @returns Validation function
 */
export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => validateWithSchema(schema, data);
}

/**
 * Creates a safe validation function for a specific schema
 * @param schema - Zod schema to create validator for
 * @returns Safe validation function
 */
export function createSafeValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => safeValidateWithSchema(schema, data);
}
