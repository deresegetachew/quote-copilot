import { IQuery } from '@nestjs/cqrs';

export class GetEmailThreadMessagesQuery implements IQuery {
  constructor(public readonly threadId: string) {}
}
