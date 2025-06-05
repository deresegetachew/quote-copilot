import { DateTime } from 'luxon';

export class EmailEntity {
  readonly id: string;
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
    id: string;
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

  getStorageId(): string {
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
