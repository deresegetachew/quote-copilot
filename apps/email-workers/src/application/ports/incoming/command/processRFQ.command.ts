export class ProcessRFQCommand {
  constructor(
    public readonly threadId: string,
    public readonly messageId: string,
  ) {}
}
