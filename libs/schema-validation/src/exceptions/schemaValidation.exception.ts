import { z } from 'zod';

export class SchemaValidationException extends Error {
  public readonly schemaError: z.ZodError;
  public readonly validationType: string;
  public readonly errors: Array<{
    path: string;
    message: string;
    code: string;
  }>;

  constructor(schemaError: z.ZodError, validationType: string) {
    const message = `Validation failed for ${validationType}`;
    super(message);
    this.name = 'SchemaValidationException';
    this.schemaError = schemaError;
    this.validationType = validationType;
    this.errors = schemaError.errors.map((error) => ({
      path: error.path.join('.'),
      message: error.message,
      code: error.code,
    }));
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SchemaValidationException);
    }
  }
}
