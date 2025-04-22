import { EmailMessageAggregate } from '../../../domain/entities/emailMessage.aggregate';

export abstract class EmailClientPort {
  abstract getUnreadMessages(): Promise<EmailMessageAggregate[]>;
}

export abstract class EmailClientFactoryPort {
  abstract getClient(provider: 'GMAIL'): EmailClientPort;
}
