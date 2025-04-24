import { EmailThreadStatusVO } from '../valueObjects/emailThreadStatus.vo';
import { EmailEntity } from './email.entity';

export class EmailMessageAggregate {
  constructor(
    private readonly threadId: string,
    private readonly emails: EmailEntity[] = [],
    private status: EmailThreadStatusVO = EmailThreadStatusVO.initial(),
  ) {}

  getThreadId(): string {
    return this.threadId;
  }

  getEmails(): Array<EmailEntity> {
    return [...this.emails];
  }

  getMessageById(messageId: string): EmailEntity | undefined {
    return this.emails.find((m) => m.getMessageId() === messageId);
  }

  getLastEmail(): EmailEntity | undefined {
    return this.emails.at(-1)?.clone();
  }
  isClosed(): boolean {
    return this.status.getValue() === 'CLOSED';
  }

  hasMessage(messageId: string): boolean {
    return this.emails.some((e) => e.getMessageId() === messageId);
  }

  toJSON(): {
    threadId: string;
    status: string;
    messages: { id: string; subject?: string }[];
  } {
    return {
      threadId: this.threadId,
      status: this.status.getValue(),
      messages: this.emails.map((e) => ({
        id: e.getMessageId(),
        subject: e.getSubject(),
      })),
    };
  }

  getStatus(): EmailThreadStatusVO {
    return this.status;
  }

  addEmail(email: EmailEntity): void {
    const exists = this.emails.some(
      (e) => e.getMessageId() === email.getMessageId(),
    );
    if (!exists) {
      this.emails.push(email);
    }
  }

  updateStatus(newStatus: EmailThreadStatusVO): void {
    if (!this.status.canTransitionTo(String(newStatus))) {
      throw new Error(
        `Invalid transition from ${this.status.getValue()} to ${newStatus.getValue()}`,
      );
    }

    this.status = newStatus;
  }

  static fromPersistence(
    threadId: string,
    emails: EmailEntity[],
    status: EmailThreadStatusVO,
  ): EmailMessageAggregate {
    return new EmailMessageAggregate(threadId, emails, status);
  }

  static createNew(
    threadId: string,
    firstEmail: EmailEntity,
  ): EmailMessageAggregate {
    return new EmailMessageAggregate(
      threadId,
      [firstEmail],
      EmailThreadStatusVO.initial(),
    );
  }
}
