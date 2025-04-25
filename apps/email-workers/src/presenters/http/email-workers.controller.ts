import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  GetUnreadEmailsQuery,
  GetEmailThreadMessagesQuery,
} from '../../application/ports/incoming/query';
import { EmailThreadResponseDTO } from '@common';
import { EmailThreadsResponseMapper } from './mappers';

@Controller('email-workers')
export class EmailWorkersController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('unread-emails')
  async getUnreadEmails(): Promise<EmailThreadResponseDTO[]> {
    const result = await this.queryBus.execute(new GetUnreadEmailsQuery());
    return result.map((thread) =>
      EmailThreadsResponseMapper.toResponse(thread),
    );
  }
  @Get('email-threads/:threadId/messages')
  async getEmailThreadMessages(
    @Param('threadId') threadId: string,
  ): Promise<EmailThreadResponseDTO> {
    const result = await this.queryBus.execute(
      new GetEmailThreadMessagesQuery(threadId),
    );

    return EmailThreadsResponseMapper.toResponse(result);
  }
}
