export class SendEmailCommand {
  constructor(
    public readonly to: string,
    public readonly subject: string,
    public readonly body: string,
    public readonly from?: string,
  ) {}
} 