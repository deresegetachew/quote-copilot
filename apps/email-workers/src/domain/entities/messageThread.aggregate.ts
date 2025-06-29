import { EmailThreadStatusVO } from '../valueObjects/emailThreadStatus.vo';
import { AttachmentEntity } from './attachment.entity';
import { EmailEntity } from './email.entity';
import { AttachmentParsingStatusVO, ID, TAggregateRoot } from '@common';
import { UnreadEmailMessageAppendedEvent } from '../events/unreadEmailMessageAppended.event';

export class MessageThreadAggregate extends TAggregateRoot {
  constructor(
    id: ID,
    private readonly threadId: string,
    private readonly emails: EmailEntity[] = [],
    private readonly attachments: AttachmentEntity[] = [],
    private status: EmailThreadStatusVO = EmailThreadStatusVO.initial(),
  ) {
    super(id);

    this.threadId = threadId;
    this.emails = emails;
    this.attachments = attachments;
    this.status = status;
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

  hasAttachments(emailId?: string): boolean {
    if (emailId) {
      return this.attachments.some((att) => att.getMessageId() === emailId);
    }
    return this.attachments.length > 0;
  }

  getAttachments(
    threadId?: string,
    emailId?: string,
    status?: AttachmentParsingStatusVO,
  ): AttachmentEntity[] {
    return this.attachments.filter((att) => {
      const matchesThread = !threadId || att.getThreadId() === threadId;
      const matchesEmail = !emailId || att.getMessageId() === emailId;
      const matchesStatus =
        !status || att.getStatus().getValue() === status.getValue();
      return matchesThread && matchesEmail && matchesStatus;
    });
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
      this.addDomainEvent(
        new UnreadEmailMessageAppendedEvent(
          this.getStorageId().getValue(),
          email,
        ),
      );
    }
  }

  addAttachment(attachment: AttachmentEntity): void {
    const exists = this.attachments.some(
      (att) => att.getAttachmentId() === attachment.getAttachmentId(),
    );
    if (!exists) {
      this.attachments.push(attachment);
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

  static createNew(
    threadId: string,
    firstEmail: EmailEntity,
    attachments: AttachmentEntity[] = [],
  ): MessageThreadAggregate {
    return new MessageThreadAggregate(
      ID.create(),
      threadId,
      [firstEmail],
      attachments,
      EmailThreadStatusVO.initial(),
    );
  }

  protected validate(): void {
    if (!this.threadId) {
      throw new Error('Thread ID cannot be empty');
    }
    if (this.emails.length === 0) {
      throw new Error('At least one email must be present in the thread');
    }
  }
}
