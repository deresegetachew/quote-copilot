export class ParseAttachmentCommand {
  constructor(
    public readonly payload: {
      threadId: string;
      messageId: string;
      attachmentId: string;
    },
  ) {}
}
