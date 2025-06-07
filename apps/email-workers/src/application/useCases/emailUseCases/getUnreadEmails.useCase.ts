import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { MessageThreadAggregate } from '../../../domain/entities/messageThread.aggregate';
import { GetUnreadEmailsQuery } from '../../ports/incoming/query/getUnreadEmails.query';
import { EmailClientFactoryPort } from '../../ports/outgoing/emailClient.port';
import { EmailMessageRepositoryPort } from '../../ports/outgoing/emailMessageRepository.port';
import { CommandBus } from '@nestjs/cqrs';
import { EmailThreadStatusVO } from '../../../domain/valueObjects/emailThreadStatus.vo';
import { TriggerEmailThreadProcessingWfCommand } from '../../ports/incoming/command';
import { Logger } from '@nestjs/common';
import { MessageThreadFactory } from '../../../domain/factories/messageThread.factory';

@QueryHandler(GetUnreadEmailsQuery)
export class GetUnreadEmailsUseCase
  implements IQueryHandler<GetUnreadEmailsQuery, MessageThreadAggregate[]>
{
  private logger = new Logger(GetUnreadEmailsUseCase.name);

  constructor(
    private readonly emailClientFactory: EmailClientFactoryPort,
    private readonly dbRepository: EmailMessageRepositoryPort,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(): Promise<MessageThreadAggregate[]> {
    const client = this.emailClientFactory.getClient('GMAIL');
    const unreadMsgsDTO = await client.getUnreadMessagesOrThrow();

    const unreadMsgs = unreadMsgsDTO.map((msg) => {
      return MessageThreadFactory.createFromEmailMessageDTO(msg);
    });

    if (unreadMsgs.length > 0) {
      const aggregates: MessageThreadAggregate[] = [];
      const savePromises: Promise<void>[] = [];
      const allUnreadMessageIds = new Set(
        unreadMsgs.flatMap((um) => um.getEmails().map((e) => e.getMessageId())),
      );

      for (const unreadMsg of unreadMsgs) {
        const threadId = unreadMsg.getThreadId();

        // Fetch existing thread status
        const existingThread = await this.dbRepository.findByThreadId(threadId);
        const currentStatus = existingThread?.getStatus();

        // Re-create the aggregate but preserve status
        const agg = new MessageThreadAggregate(
          unreadMsg.getStorageId(),
          threadId,
          [
            ...(existingThread?.getEmails() ?? []),
            ...(unreadMsg?.getEmails() ?? []),
          ],
          unreadMsg.getAttachments(),
          currentStatus ?? EmailThreadStatusVO.initial(),
        );

        aggregates.push(agg);
        savePromises.push(this.dbRepository.save(agg));
      }

      await Promise.all(savePromises);

      const commands: Promise<any>[] = [];
      const threadMessageIdMap: Record<string, Set<string>> = {};

      for (const agg of aggregates) {
        const _unreadThreadMsgs = new Set(
          agg
            .getEmails()
            .filter((email) => allUnreadMessageIds.has(email.getMessageId())),
        );

        if (_unreadThreadMsgs.size > 0) {
          const threadId = agg.getThreadId();

          for (const email of _unreadThreadMsgs) {
            if (!threadMessageIdMap[threadId]) {
              threadMessageIdMap[threadId] = new Set();
            }
            threadMessageIdMap[threadId].add(email.getMessageId());
          }

          for (const email of _unreadThreadMsgs) {
            commands.push(
              this.commandBus.execute(
                new TriggerEmailThreadProcessingWfCommand(
                  threadId,
                  email.getMessageId(),
                ),
              ),
            );
          }
        }

        // fire all workflow triggers in parallel
        await Promise.all(commands);

        // mark all messages in parallel by thread
        await Promise.all(
          Object.entries(threadMessageIdMap).map(([threadId, messageIds]) =>
            client
              .markMessagesAsAgentReadOrThrow(Array.from(messageIds))
              .catch((err) => {
                this.logger.warn(
                  `Failed to mark messages as read for thread ${threadId}: ${err}`,
                );
              }),
          ),
        );
      }

      return aggregates;
    }

    return [];
  }
}
