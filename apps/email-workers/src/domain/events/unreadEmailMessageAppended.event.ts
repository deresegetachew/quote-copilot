import { EmailEntity } from '../entities/email.entity';

export class UnreadEmailMessageAppendedEvent {
  constructor(
    public readonly threadId: string,
    public readonly newMessage: EmailEntity,
  ) {}
}
