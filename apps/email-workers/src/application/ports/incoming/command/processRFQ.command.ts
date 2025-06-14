export class ProcessRFQCommand {
  constructor(
    public readonly threadId: string,
    public readonly messageId: string,
    public readonly rfqData: any, // Define proper type as needed
  ) {}
} 