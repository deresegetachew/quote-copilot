import { DateTime } from 'luxon';

export class ThreadEntity {
  private readonly threadId: string;
  private readonly subject: string;
  private messageIds: string[];
  private readonly createdAt?: DateTime;
  private readonly updatedAt?: DateTime;

  constructor(
    threadId: string,
    subject: string,
    messageIds: string[],
    createdAt?: DateTime,
    updatedAt?: DateTime,
  ) {
    this.threadId = threadId;
    this.subject = subject;
    this.messageIds = messageIds;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  getThreadId(): string {
    return this.threadId;
  }

  getSubject(): string {
    return this.subject;
  }

  getMessageIds(): string[] {
    return this.messageIds;
  }

  getCreatedAt(): DateTime | undefined {
    return this.createdAt;
  }

  getUpdatedAt(): DateTime | undefined {
    return this.updatedAt;
  }

  addMessageId(messageId: string): void {
    if (!this.messageIds.includes(messageId)) {
      this.messageIds.push(messageId);
    }
  }

  removeMessageId(messageId: string): void {
    this.messageIds = this.messageIds.filter((id) => id !== messageId);
  }
}
