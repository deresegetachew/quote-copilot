import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  GetUnreadEmailsQuery,
  GetEmailThreadMessagesQuery,
} from '../../application/ports/incoming/query';
import { EmailThreadsResponseMapper } from './mappers';
import { schemaPipe } from '@schema-validation';
import {
  GetUnreadEmailsQuerySchema,
  GetEmailThreadMessagesParamSchema,
  TGetUnreadEmailsResponse,
  TGetEmailThreadMessagesResponse,
  TGetEmailThreadMessagesParam,
} from '@common/dtos';

@Controller('email-workers')
export class EmailWorkersController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('unread-emails')
  async getUnreadEmails(
    @Query(schemaPipe(GetUnreadEmailsQuerySchema))
    query?: GetUnreadEmailsQuery,
  ): Promise<TGetUnreadEmailsResponse[]> {
    const result = await this.queryBus.execute(new GetUnreadEmailsQuery());
    return result.map((thread) =>
      EmailThreadsResponseMapper.toResponse(thread),
    );
  }

  @Get('email-threads/:storageThreadID/messages')
  async getEmailThreadMessages(
    @Param(schemaPipe(GetEmailThreadMessagesParamSchema))
    { storageThreadID }: TGetEmailThreadMessagesParam,
  ): Promise<TGetEmailThreadMessagesResponse> {
    const result = await this.queryBus.execute(
      new GetEmailThreadMessagesQuery(storageThreadID),
    );

    if (!result) {
      throw new NotFoundException(
        `Email thread with ID ${storageThreadID} not found`,
      );
    }

    return EmailThreadsResponseMapper.toResponse(result);
  }
}
