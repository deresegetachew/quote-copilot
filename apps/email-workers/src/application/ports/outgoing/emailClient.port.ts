import { EmailMessageAggregate } from '../../../domain/entities/emailMessage.aggregate';

export abstract class EmailClientPort {
  abstract getUnreadMessages(): Promise<EmailMessageAggregate[]>;
  abstract markMessagesAsAgentRead(messageIds: string[]): Promise<void>;
  abstract getMessageById(messageId: string): Promise<EmailMessageAggregate>;
  abstract getMessagesByThreadId(
    threadId: string,
  ): Promise<EmailMessageAggregate[]>;
  abstract searchByQuery(query: string): Promise<EmailMessageAggregate[]>;
}

export abstract class EmailClientFactoryPort {
  abstract getClient(provider: 'GMAIL'): EmailClientPort;
}
