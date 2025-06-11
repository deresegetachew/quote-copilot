import { DateTime } from 'luxon';
import { ID } from '@common/valueObjects/id.vo';

export class EmailEntity {
  readonly id: ID;
  readonly messageId: string;
  readonly threadId: string;
  readonly from: string;
  readonly to: string;
  readonly subject?: string;
  readonly body?: string;
  readonly receivedAt?: DateTime;

  constructor({
    id,
    messageId,
    threadId,
    from,
    to,
    subject,
    body,
    receivedAt,
  }: {
    id: ID;
    messageId: string;
    threadId: string;
    from: string;
    to: string;
    subject?: string;
    body?: string;
    receivedAt?: DateTime;
  }) {
    this.id = id;
    this.messageId = messageId;
    this.threadId = threadId;
    this.from = from;
    this.to = to;
    this.subject = subject;
    this.body = body;
    this.receivedAt = receivedAt;
  }

  getId(): ID {
    return this.id;
  }

  getStorageId(): ID {
    return this.id;
  }

  getMessageId(): string {
    return this.messageId;
  }

  getThreadId(): string {
    return this.threadId;
  }

  getFrom(): string {
    return this.from;
  }

  getTo(): string {
    return this.to;
  }

  getSubject(): string | undefined {
    return this.subject;
  }

  getBody(): string | undefined {
    return this.body;
  }

  getReceivedAt(): DateTime | undefined {
    return this.receivedAt;
  }

  clone(): EmailEntity {
    return new EmailEntity({
      id: this.id,
      messageId: this.messageId,
      threadId: this.threadId,
      from: this.from,
      to: this.to,
      subject: this.subject,
      body: this.body,
      receivedAt: this.receivedAt
        ? DateTime.fromJSDate(this.receivedAt.toJSDate())
        : undefined,
    });
  }
}
