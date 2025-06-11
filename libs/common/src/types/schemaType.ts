import { z } from 'zod';

/**
 * Utility type for inferring the TypeScript type from a Zod schema.
 * Usage: SchemaType(MySchema)
 */
export type SchemaType<T extends z.ZodTypeAny> = z.infer<T>;
