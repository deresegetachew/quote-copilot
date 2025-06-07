import { AttachmentParsingStatusVO } from '@common';

export class AttachmentEntity {
  private readonly id: string | null = null;
  private readonly attachmentId: string;
  private readonly threadId: string;
  private readonly messageId: string;
  private readonly fileName: string;
  private readonly mimeType: string;
  private status: AttachmentParsingStatusVO =
    AttachmentParsingStatusVO.initial();

  constructor({
    id,
    attachmentId,
    threadId,
    messageId, //emailID
    fileName,
    mimeType,
  }: {
    id: string | null;
    attachmentId: string;
    threadId: string;
    messageId: string;
    fileName: string;
    mimeType: string;
  }) {
    this.id = id;
    this.attachmentId = attachmentId;
    this.threadId = threadId;
    this.messageId = messageId;
    this.fileName = fileName;
    this.mimeType = mimeType;
  }

  getStorageId(): string | null {
    return this.id;
  }

  getAttachmentId(): string {
    return this.attachmentId;
  }

  getThreadId(): string {
    return this.threadId;
  }

  getMessageId(): string {
    return this.messageId;
  }

  getFileName(): string {
    return this.fileName;
  }

  getMimeType(): string {
    return this.mimeType;
  }

  getStatus(): AttachmentParsingStatusVO {
    return this.status;
  }

  updateStatus(status: AttachmentParsingStatusVO): void {
    if (!this.status.canTransitionTo(String(status))) {
      throw new Error(
        `Invalid transition from ${this.status.getValue()} to ${status.getValue()}`,
      );
    }
    this.status = status;
  }
}
