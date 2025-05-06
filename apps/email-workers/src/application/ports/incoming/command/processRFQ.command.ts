export class ProcessRFQCommand {
  public readonly threadId: string;
  public readonly messageId: string;
  public readonly parsedRequest: any;

  constructor(
    public readonly threadId: string,
    public readonly messageId: string,
  ) {
    this.threadId = threadId;
    this.messageId = messageId;
  }
}
