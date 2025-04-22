export class EmailMessage {
  constructor(
    public readonly threadId: string,
    public readonly messageId: string,
    public readonly from: string,
    public readonly subject: string,
    public readonly body: string,
    public readonly receivedAt: Date,
  ) {}
}
