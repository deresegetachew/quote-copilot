import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUnreadEmailsQuery } from '../ports/incoming/get-unread-emails.query';
import { EmailClientFactoryPort } from '../ports/outgoing/emailClient.port';
import { EmailMessage } from '../../domain/entities/email-message.entity';

@QueryHandler(GetUnreadEmailsQuery)
export class GetUnreadEmailsUseCase
  implements IQueryHandler<GetUnreadEmailsQuery, EmailMessage[]>
{
  constructor(private readonly emailClientFactory: EmailClientFactoryPort) {}

  async execute(): Promise<EmailMessage[]> {
    const client = this.emailClientFactory.getClient('GMAIL');

    return client.getUnreadMessages();
  }
}
