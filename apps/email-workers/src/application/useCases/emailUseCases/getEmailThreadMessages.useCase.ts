import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { EmailClientFactoryPort } from '../../ports/outgoing/emailClient.port';
import { EmailMessageRepositoryPort } from '../../ports/outgoing/emailMessageRepository.port';
import {
  GetEmailThreadMessagesQuery,
  GetEmailThreadMessagesQuerySchema,
} from '../../ports/incoming/query';
import { MessageThreadAggregate } from '../../../domain/entities/messageThread.aggregate';
import { ValidateQuerySchema } from '@schema-validation';

@QueryHandler(GetEmailThreadMessagesQuery)
@ValidateQuerySchema(GetEmailThreadMessagesQuerySchema)
export class GetEmailThreadMessagesUseCase
  implements
    IQueryHandler<GetEmailThreadMessagesQuery, MessageThreadAggregate | null>
{
  constructor(private readonly dbRepository: EmailMessageRepositoryPort) {}

  async execute(
    query: GetEmailThreadMessagesQuery,
  ): Promise<MessageThreadAggregate | null> {
    const { threadId } = query;

    return await this.dbRepository.findByStorageThreadId(threadId);
  }
}
