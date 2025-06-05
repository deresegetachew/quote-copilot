import { MessageThreadAggregate } from '../../../domain/entities/messageThread.aggregate';
import { EmailMessageDTO } from './dto/emailMessage.dto';

export abstract class EmailClientPort {
  abstract getUnreadMessages(): Promise<EmailMessageDTO[]>;
  abstract markMessagesAsAgentRead(messageIds: string[]): Promise<void>;
  abstract getMessageById(messageId: string): Promise<EmailMessageDTO>;
  abstract getMessagesByThreadId(threadId: string): Promise<EmailMessageDTO[]>;
  abstract searchByQuery(query: string): Promise<EmailMessageDTO[]>;
}

export abstract class EmailClientFactoryPort {
  abstract getClient(provider: 'GMAIL'): EmailClientPort;
}
