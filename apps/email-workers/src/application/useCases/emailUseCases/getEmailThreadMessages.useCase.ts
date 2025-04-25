import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { EmailClientFactoryPort } from '../../ports/outgoing/emailClient.port';
import { EmailMessageRepositoryPort } from '../../ports/outgoing/emailMessageRepository.port';
import { GetEmailThreadMessagesQuery } from '../../ports/incoming/query';
import { EmailMessageAggregate } from '../../../domain/entities/emailMessage.aggregate';

@QueryHandler(GetEmailThreadMessagesQuery)
export class GetEmailThreadMessagesUseCase
  implements IQueryHandler<GetEmailThreadMessagesQuery, EmailMessageAggregate>
{
  constructor(
    private readonly emailClientFactory: EmailClientFactoryPort,
    private readonly dbRepository: EmailMessageRepositoryPort,
  ) {}

  async execute(
    query: GetEmailThreadMessagesQuery,
  ): Promise<EmailMessageAggregate> {
    const { threadId } = query;

    return await this.dbRepository.findByThreadId(threadId);
  }
}
