import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUnreadEmailsQuery } from '../ports/incoming/getUnreadEmails.query';
import { EmailClientFactoryPort } from '../ports/outgoing/emailClient.port';
import { EmailMessageAggregate } from '../../domain/entities/emailMessage.aggregate';
import { EmailMessageRepositoryPort } from '../ports/outgoing/emailMessageRepository.port';

@QueryHandler(GetUnreadEmailsQuery)
export class GetUnreadEmailsUseCase
  implements IQueryHandler<GetUnreadEmailsQuery, EmailMessageAggregate[]>
{
  constructor(
    private readonly emailClientFactory: EmailClientFactoryPort,
    private readonly dbRepository: EmailMessageRepositoryPort,
  ) {}

  async execute(): Promise<EmailMessageAggregate[]> {
    const client = this.emailClientFactory.getClient('GMAIL');

    const msgs = await client.getUnreadMessages();

    if (msgs.length > 0) {
      // Note: current implementation processes up to 10 messages in parallel
      // Consider using a queue for better scalability in the future

      const aggregates: EmailMessageAggregate[] = [];
      const savePromises: Promise<void>[] = [];

      for (const emailMessages of msgs) {
        const lastEmail = emailMessages.getLastEmail();

        if (lastEmail) {
          aggregates.push(emailMessages);
          savePromises.push(this.dbRepository.save(emailMessages));
        }
      }

      await Promise.all(savePromises);
      return aggregates;
    }

    return [];
  }
}
