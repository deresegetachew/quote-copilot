import { EmailMessage } from '../../../domain/entities/email-message.entity';

export abstract class EmailClientPort {
  abstract getUnreadMessages(): Promise<EmailMessage[]>;
}

export abstract class EmailClientFactoryPort {
  abstract getClient(provider: 'GMAIL'): EmailClientPort;
}
