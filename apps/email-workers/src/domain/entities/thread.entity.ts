import { DateTime } from 'luxon';
import { ID } from '@common/valueObjects/id.vo';

export class ThreadEntity {
  private readonly id: ID;
  private readonly threadId: string;
  private readonly subject: string;
  private messageIds: string[];
  private readonly createdAt?: DateTime;
  private readonly updatedAt?: DateTime;

  constructor(
    id: ID,
    threadId: string,
    subject: string,
    messageIds: string[],
    createdAt?: DateTime,
    updatedAt?: DateTime,
  ) {
    this.id = id;
    this.threadId = threadId;
    this.subject = subject;
    this.messageIds = messageIds;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  getId(): ID {
    return this.id;
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
