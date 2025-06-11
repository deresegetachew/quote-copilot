import { z } from 'zod';
import { SchemaValidationPipe } from './schemaValidation.pipe';

/**
 * Factory function to create a SchemaValidationPipe instance
 * Allows for cleaner usage without needing to use 'new' keyword
 *
 * @example
 * ```typescript
 * @Post('threads/:threadId')
 * async getThread(
 *   @Param('threadId', schemaValidationPipe(ThreadIdSchema)) threadId: string
 * ) {
 *   return this.threadService.getById(threadId);
 * }
 * ```
 *
 * @param schema - The Zod schema to validate against
 * @param validationType - Optional validation type for error messages
 * @param options - Optional configuration options
 * @returns A new instance of SchemaValidationPipe
 */
export function schemaPipe<T = any>(
  schema: z.ZodSchema<T>,
  validationType?: string,
  options?: {
    errorMessage?: string;
    transform?: boolean;
    stripUnknown?: boolean;
  },
): SchemaValidationPipe<T> {
  return new SchemaValidationPipe(schema, validationType, options);
}
