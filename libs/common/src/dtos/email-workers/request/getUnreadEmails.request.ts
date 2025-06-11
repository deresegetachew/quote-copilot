import { z } from 'zod';

// Query schema for unread emails endpoint
export const GetUnreadEmailsQuerySchema = z
  .object({
    // Add query params as needed, e.g.:
    status: z.string().optional(),
    page: z.number().int().min(1).optional(),
  })
  .strict();

export type TGetUnreadEmailsQuery = z.infer<typeof GetUnreadEmailsQuerySchema>;
