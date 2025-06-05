export class EmailMessageDTO {
  messageId!: string;
  threadId!: string;
  from!: string;
  to!: string;
  subject!: string;
  body!: string;
  receivedAt!: Date;
  attachments!: {
    attachmentId: string;
    fileName: string;
    mimeType: string;
  }[];

  constructor(
    id: string,
    threadId: string,
    from: string,
    to: string,
    subject: string,
    body: string,
    receivedAt: Date,
    attachments: {
      attachmentId: string;
      fileName: string;
      mimeType: string;
    }[],
  ) {
    this.messageId = id;
    this.threadId = threadId;
    this.from = from;
    this.to = to;
    this.subject = subject;
    this.body = body;
    this.receivedAt = receivedAt;
    this.attachments = attachments;
  }
}
