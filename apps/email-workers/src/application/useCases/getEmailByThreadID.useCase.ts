import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { EmailMessageRepositoryPort } from '../ports/outgoing/emailMessageRepository.port';
import { EmailMessageAggregate } from '../../domain/entities/emailMessage.aggregate';

export class GetEmailByThreadIDQuery {
  constructor(public readonly threadId: string) {}
}

@QueryHandler(GetEmailByThreadIDQuery)
export class GetEmailByThreadIDUseCase
  implements
    IQueryHandler<GetEmailByThreadIDQuery, EmailMessageAggregate | null>
{
  constructor(
    private readonly emailMessageRepository: EmailMessageRepositoryPort,
  ) {}

  async execute(
    query: GetEmailByThreadIDQuery,
  ): Promise<EmailMessageAggregate | null> {
    return this.emailMessageRepository.findByThreadId(query.threadId);
  }
}
