import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { MessageThreadAggregate } from '../../../domain/entities/messageThread.aggregate';
import { GetUnreadEmailsQuery } from '../../ports/incoming/query/getUnreadEmails.query';
import { EmailClientFactoryPort } from '../../ports/outgoing/emailClient.port';
import { EmailMessageRepositoryPort } from '../../ports/outgoing/emailMessageRepository.port';
import { CommandBus } from '@nestjs/cqrs';
import { EmailThreadStatusVO } from '../../../domain/valueObjects/emailThreadStatus.vo';
import { Logger } from '@nestjs/common';
import { MessageThreadFactory } from '../../../domain/factories/messageThread.factory';
import { DomainEventsPublisher } from '@common/eventPublishers/domainEventPublisher';
import { EmailEntity } from '../../../domain/entities/email.entity';

@QueryHandler(GetUnreadEmailsQuery)
export class GetUnreadEmailsUseCase
  implements IQueryHandler<GetUnreadEmailsQuery, MessageThreadAggregate[]>
{
  private logger = new Logger(GetUnreadEmailsUseCase.name);

  constructor(
    private readonly emailClientFactory: EmailClientFactoryPort,
    private readonly dbRepository: EmailMessageRepositoryPort,
    private readonly domainEventPublisher: DomainEventsPublisher,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(): Promise<MessageThreadAggregate[]> {
    const client = this.emailClientFactory.getClient('GMAIL');
    const unreadMsgsDTO = await client.getUnreadMessagesOrThrow();

    if (unreadMsgsDTO.length === 0) {
      return [];
    }

    const unreadMsgs = unreadMsgsDTO.map((msg) =>
      MessageThreadFactory.createFromEmailMessageDTO(msg),
    );

    const threadIds = [...new Set(unreadMsgs.map((msg) => msg.getThreadId()))];
    const existingThreadsMap =
      await this.dbRepository.findByThreadIds(threadIds);

    const aggregates = unreadMsgs.map((unreadMsg) => {
      const existingThread = existingThreadsMap.get(unreadMsg.getThreadId());
      const currentStatus =
        existingThread?.getStatus() ?? EmailThreadStatusVO.initial();
      const existingEmails = existingThread?.getEmails() ?? [];

      const aggregate = new MessageThreadAggregate(
        unreadMsg.getStorageId(),
        unreadMsg.getThreadId(),
        [...existingEmails],
        unreadMsg.getAttachments(),
        currentStatus,
      );

      const newMessages = this.filterNewMessages(
        unreadMsg.getEmails(),
        existingEmails,
      );

      newMessages.forEach((msg) => {
        aggregate.addEmail(msg);
      });

      return aggregate;
    });

    // TODO: Transaction begins here

    await this.saveAggregates(aggregates);

    await this.domainEventPublisher.publishAll(aggregates);

    // TODO: Transaction ends here

    return aggregates;
  }

  private async saveAggregates(
    aggregates: MessageThreadAggregate[],
  ): Promise<void> {
    const savePromises = aggregates.map((agg) => this.dbRepository.save(agg));
    await Promise.all(savePromises);
  }

  private filterNewMessages(
    newBatch: EmailEntity[],
    existingBatch: EmailEntity[],
  ): EmailEntity[] {
    const existingIds = new Set(existingBatch.map((e) => e.getMessageId()));
    return newBatch.filter((e) => !existingIds.has(e.getMessageId()));
  }
}
