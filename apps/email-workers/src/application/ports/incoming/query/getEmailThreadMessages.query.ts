import { IQuery } from '@nestjs/cqrs';
import { z } from 'zod';

// Schema for validating the get email thread messages query
export const GetEmailThreadMessagesQuerySchema = z.object({
  threadId: z.string().min(1, 'Thread ID is required'),
});

export class GetEmailThreadMessagesQuery implements IQuery {
  constructor(
    public readonly threadId: z.infer<
      typeof GetEmailThreadMessagesQuerySchema
    >['threadId'],
  ) {}
}
