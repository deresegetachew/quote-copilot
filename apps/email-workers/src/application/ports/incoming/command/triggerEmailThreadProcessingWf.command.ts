export class TriggerEmailThreadProcessingWfCommand {
  constructor(
    public readonly threadId: string,
    public readonly messageId: string,
  ) {
    this.threadId = threadId;
    this.messageId = messageId;
  }
}
