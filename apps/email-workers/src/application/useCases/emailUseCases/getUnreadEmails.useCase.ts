import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { EmailMessageAggregate } from '../../../domain/entities/emailMessage.aggregate';
import { GetUnreadEmailsQuery } from '../../ports/incoming/query/getUnreadEmails.query';
import { EmailClientFactoryPort } from '../../ports/outgoing/emailClient.port';
import { EmailMessageRepositoryPort } from '../../ports/outgoing/emailMessageRepository.port';
import { CommandBus } from '@nestjs/cqrs';
import { EmailThreadStatusVO } from '../../../domain/valueObjects/emailThreadStatus.vo';
import { TriggerEmailThreadProcessingWfCommand } from '../../ports/incoming/command';

@QueryHandler(GetUnreadEmailsQuery)
export class GetUnreadEmailsUseCase
  implements IQueryHandler<GetUnreadEmailsQuery, EmailMessageAggregate[]>
{
  constructor(
    private readonly emailClientFactory: EmailClientFactoryPort,
    private readonly dbRepository: EmailMessageRepositoryPort,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(): Promise<EmailMessageAggregate[]> {
    const client = this.emailClientFactory.getClient('GMAIL');

    const msgs = await client.getUnreadMessages();

    if (msgs.length > 0) {
      const aggregates: EmailMessageAggregate[] = [];
      const savePromises: Promise<void>[] = [];

      for (const emailMessages of msgs) {
        const threadId = emailMessages.getThreadId();

        // Fetch existing thread status
        const existingThread = await this.dbRepository.findByThreadId(threadId);
        const currentStatus = existingThread?.getStatus();

        // Re-create the aggregate but preserve status
        const agg = new EmailMessageAggregate(
          emailMessages.getStorageId(),
          threadId,
          emailMessages.getEmails(),
          currentStatus ?? EmailThreadStatusVO.initial(),
        );

        const lastEmail = agg.getLastEmail();

        if (lastEmail) {
          aggregates.push(agg);
          savePromises.push(this.dbRepository.save(agg));
        }
      }

      await Promise.all(savePromises);

      for (const agg of aggregates) {
        // this should be a domain event not a command
        await this.commandBus.execute(
          new TriggerEmailThreadProcessingWfCommand(
            agg.getThreadId(),
            agg.getLastEmail()?.getMessageId(),
          ),
        );
      }

      return aggregates;
    }

    return [];
  }
}
