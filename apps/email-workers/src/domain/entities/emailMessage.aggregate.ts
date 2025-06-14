import { EmailThreadStatusVO } from '../valueObjects/emailThreadStatus.vo';
import { EmailEntity } from './email.entity';

export class EmailMessageAggregate {
  constructor(
    private readonly id: string | null,
    private readonly threadId: string,
    emails: EmailEntity[] = [],
    private status: EmailThreadStatusVO = EmailThreadStatusVO.initial(),
  ) {
    // Deduplicate emails by messageId to prevent duplicates
    const uniqueEmails: EmailEntity[] = [];
    const seenMessageIds = new Set<string>();
    
    for (const email of emails) {
      if (!seenMessageIds.has(email.getMessageId())) {
        seenMessageIds.add(email.getMessageId());
        uniqueEmails.push(email);
      }
    }
    
    this.emails = uniqueEmails;
  }

  private readonly emails: EmailEntity[];

  getStorageId(): string | null {
    return this.id;
  }

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
    id: string,
    threadId: string,
    emails: EmailEntity[],
    status: EmailThreadStatusVO,
  ): EmailMessageAggregate {
    return new EmailMessageAggregate(id, threadId, emails, status);
  }

  static createNew(
    threadId: string,
    firstEmail: EmailEntity,
  ): EmailMessageAggregate {
    return new EmailMessageAggregate(
      null,
      threadId,
      [firstEmail],
      EmailThreadStatusVO.initial(),
    );
  }
}
