import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { EmailMessage } from '../../domain/entities/email-message.entity';
import { GetUnreadEmailsQuery } from '../../application/ports/incoming/get-unread-emails.query';

@Controller('email-workers')
export class EmailWorkersController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('unread-emails')
  async getUnreadEmails(): Promise<EmailMessage[]> {
    return await this.queryBus.execute(new GetUnreadEmailsQuery());
  }
}
