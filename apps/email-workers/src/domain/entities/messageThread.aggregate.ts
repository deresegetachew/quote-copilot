import { file } from 'googleapis/build/src/apis/file';
import { EmailThreadStatusVO } from '../valueObjects/emailThreadStatus.vo';
import { AttachmentEntity } from './attachment.entity';
import { EmailEntity } from './email.entity';
import { AttachmentParsingStatusVO } from '../valueObjects/attachmentParsingStatus.vo';

export class MessageThreadAggregate {
  constructor(
    private readonly id: string | null,
    private readonly threadId: string,
    private readonly emails: EmailEntity[] = [],
    private readonly attachments: AttachmentEntity[] = [],
    private status: EmailThreadStatusVO = EmailThreadStatusVO.initial(),
  ) {}

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

  hasAttachments(emailId?: string): boolean {
    if (emailId) {
      return this.attachments.some((att) => att.getMessageId() === emailId);
    }
    return this.attachments.length > 0;
  }

  getAttachments(
    emailId?: string,
    status?: AttachmentParsingStatusVO,
  ): AttachmentEntity[] {
    if (emailId) {
      return this.attachments.filter(
        (att) =>
          att.getMessageId() === emailId &&
          (status ? att.getStatus().equals(status) : true),
      );
    }
    return status
      ? this.attachments.filter((att) => att.getStatus().equals(status))
      : [...this.attachments];
  }

  toJSON(): {
    threadId: string;
    status: string;
    messages: { id: string; subject?: string }[];
    attachments: {
      messageId: string;
      attachmentId: string;
      fileName: string;
      mimeType: string;
    }[];
  } {
    return {
      threadId: this.threadId,
      status: this.status.getValue(),
      messages: this.emails.map((e) => ({
        id: e.getMessageId(),
        subject: e.getSubject(),
      })),
      attachments: this.attachments.map((att) => ({
        messageId: att.getMessageId(),
        attachmentId: att.getAttachmentId(),
        fileName: att.getFileName(),
        mimeType: att.getMimeType(),
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

  static fromPersistence(
    id: string,
    threadId: string,
    emails: EmailEntity[],
    attachments: AttachmentEntity[],
    status: EmailThreadStatusVO,
  ): MessageThreadAggregate {
    return new MessageThreadAggregate(
      id,
      threadId,
      emails,
      attachments,
      status,
    );
  }

  static createNew(
    threadId: string,
    firstEmail: EmailEntity,
    attachments: AttachmentEntity[] = [],
  ): MessageThreadAggregate {
    return new MessageThreadAggregate(
      null,
      threadId,
      [firstEmail],
      attachments,
      EmailThreadStatusVO.initial(),
    );
  }

  static addMessage(
    thread: MessageThreadAggregate,
    email: EmailEntity,
    attachments: AttachmentEntity[] = [],
  ): MessageThreadAggregate {
    const existingThread = thread.getStorageId()
      ? thread
      : MessageThreadAggregate.createNew(
          thread.getThreadId(),
          email,
          attachments,
        );

    existingThread.addEmail(email);
    attachments.forEach((att) => existingThread.addAttachment(att));

    return existingThread;
  }
}
