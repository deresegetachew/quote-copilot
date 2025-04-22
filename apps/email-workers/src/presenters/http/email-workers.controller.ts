import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { EmailMessageAggregate } from '../../domain/entities/emailMessage.aggregate';
import { GetUnreadEmailsQuery } from '../../application/ports/incoming/getUnreadEmails.query';

@Controller('email-workers')
export class EmailWorkersController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('unread-emails')
  async getUnreadEmails(): Promise<EmailMessageAggregate[]> {
    return await this.queryBus.execute(new GetUnreadEmailsQuery());
  }
}
