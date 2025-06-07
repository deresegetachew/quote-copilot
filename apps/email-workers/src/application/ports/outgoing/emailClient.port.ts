import { MessageThreadAggregate } from '../../../domain/entities/messageThread.aggregate';
import { EmailMessageDTO } from './dto/emailMessage.dto';

export abstract class EmailClientPort {
  abstract getUnreadMessagesOrThrow(): Promise<EmailMessageDTO[]>;
  abstract markMessagesAsAgentReadOrThrow(messageIds: string[]): Promise<void>;
  abstract getMessageByIdOrThrow(messageId: string): Promise<EmailMessageDTO>;
  abstract getMessagesByThreadIdOrThrow(
    threadId: string,
  ): Promise<EmailMessageDTO[]>;
  abstract searchByQueryOrThrow(query: string): Promise<EmailMessageDTO[]>;
}

export abstract class EmailClientFactoryPort {
  abstract getClient(provider: 'GMAIL'): EmailClientPort;
}
