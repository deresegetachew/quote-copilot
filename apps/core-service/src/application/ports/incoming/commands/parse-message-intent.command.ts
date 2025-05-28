export class ParseMessageIntentCommand {
  constructor(
    public readonly payload: { threadId: string; messageId: string },
  ) {}
}
