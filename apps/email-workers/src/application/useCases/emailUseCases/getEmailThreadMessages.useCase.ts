import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { EmailClientFactoryPort } from '../../ports/outgoing/emailClient.port';
import { EmailMessageRepositoryPort } from '../../ports/outgoing/emailMessageRepository.port';
import { GetEmailThreadMessagesQuery } from '../../ports/incoming/query';
import { MessageThreadAggregate } from '../../../domain/entities/messageThread.aggregate';

@QueryHandler(GetEmailThreadMessagesQuery)
export class GetEmailThreadMessagesUseCase
  implements IQueryHandler<GetEmailThreadMessagesQuery, MessageThreadAggregate>
{
  constructor(private readonly dbRepository: EmailMessageRepositoryPort) {}

  async execute(
    query: GetEmailThreadMessagesQuery,
  ): Promise<MessageThreadAggregate> {
    const { threadId } = query;

    return await this.dbRepository.findByThreadId(threadId);
  }
}
