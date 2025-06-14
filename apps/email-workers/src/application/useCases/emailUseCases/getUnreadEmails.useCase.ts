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
import { ID } from '@common';

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

    const aggregates = unreadMsgs.map((unreadMsg) =>
      this.createOrUpdateAggregate(unreadMsg, existingThreadsMap),
    );

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

  /**
   * Creates a new aggregate or updates an existing one with new unread messages
   */
  private createOrUpdateAggregate(
    unreadMsg: MessageThreadAggregate,
    existingThreadsMap: Map<string, MessageThreadAggregate>,
  ): MessageThreadAggregate {
    const existingThread = existingThreadsMap.get(unreadMsg.getThreadId());
    const threadData = this.extractThreadData(unreadMsg, existingThread);

    this.logger.debug(
      `Processing thread ${unreadMsg.getThreadId()}: ${existingThread ? 'existing' : 'new'}, storageId: ${threadData.storageId.getValue()}`,
    );

    const aggregate = this.buildAggregate(unreadMsg, threadData);

    // add new messages to the aggregate
    this.addNewMessages(
      aggregate,
      unreadMsg.getEmails(),
      existingThread ? existingThread.getEmails() : [],
    );

    return aggregate;
  }

  /**
   * Extracts thread data with proper fallbacks for existing vs new threads
   */
  private extractThreadData(
    unreadMsg: MessageThreadAggregate,
    existingThread?: MessageThreadAggregate,
  ) {
    return existingThread
      ? {
          storageId: existingThread.getStorageId(),
          status: existingThread.getStatus(),
          emails: existingThread.getEmails(),
        }
      : {
          storageId: unreadMsg.getStorageId(),
          status: EmailThreadStatusVO.initial(),
          emails: [] as EmailEntity[],
        };
  }

  /**
   * Builds a MessageThreadAggregate with the provided data and adds new messages
   */
  private buildAggregate(
    unreadMsg: MessageThreadAggregate,
    threadData: {
      storageId: ID;
      status: EmailThreadStatusVO;
      emails: EmailEntity[];
    },
  ): MessageThreadAggregate {
    const aggregate = new MessageThreadAggregate(
      threadData.storageId,
      unreadMsg.getThreadId(),
      [...threadData.emails],
      unreadMsg.getAttachments(),
      threadData.status,
    );

    return aggregate;
  }

  /**
   * Adds new messages to the aggregate (avoiding duplicates)
   */
  private addNewMessages(
    aggregate: MessageThreadAggregate,
    newMessages: EmailEntity[],
    existingMessages: EmailEntity[],
  ): void {
    const filteredNewMessages = this.filterNewMessages(
      newMessages,
      existingMessages,
    );
    filteredNewMessages.forEach((msg) => aggregate.addEmail(msg));
  }
}
