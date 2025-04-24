import { IQuery } from '@nestjs/cqrs';

export class GetEmailByThreadIDQuery implements IQuery {
  constructor(private threadID: string) {
    this.threadID = threadID;
  }
}
