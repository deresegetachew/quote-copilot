export class SendReplyCommand {
  constructor(
    public readonly to: string,
    public readonly subject: string,
    public readonly body: string,
    public readonly threadId: string,
    public readonly inReplyTo?: string,
    public readonly references?: string,
    public readonly from?: string,
  ) {}
} 