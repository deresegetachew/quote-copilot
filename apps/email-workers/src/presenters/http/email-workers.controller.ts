import { Controller, Get, Param, Post, Body, Query } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import {
  GetUnreadEmailsQuery,
  GetEmailThreadMessagesQuery,
} from '../../application/ports/incoming/query';
import { SendEmailCommand, SendReplyCommand } from '../../application/ports/incoming/command';
import { EmailThreadsResponseMapper } from './mappers';
import { schemaPipe } from '@schema-validation';
import {
  GetUnreadEmailsQuerySchema,
  GetEmailThreadMessagesParamSchema,
  TGetUnreadEmailsResponse,
  TGetEmailThreadMessagesResponse,
  TGetEmailThreadMessagesParam,
} from '@common/dtos';
import { SendRfqConfirmationEmailCommand } from '../../application/ports/incoming/command/sendRfqConfirmationEmail.command';

export interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

export interface SendReplyRequest {
  to: string;
  subject: string;
  body: string;
  threadId: string;
  inReplyTo?: string;
  references?: string;
}

export interface SendRfqConfirmationRequest {
  to: string;
  subject: string;
  threadId: string;
  inReplyTo?: string;
  references?: string;
  customerName?: string;
  rfqSummary?: string;
  items?: Array<{
    itemCode: string;
    itemDescription: string | null;
    quantity: number;
    unit: string | null;
    notes: string[] | null;
  }>;
  emailType: 'RFQ_NEW_CONFIRMATION' | 'RFQ_FOLLOWUP_CONFIRMATION';
}

@Controller('email-workers')
export class EmailWorkersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

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

  @Get('email-threads/:threadId/messages')
  async getEmailThreadMessages(
    @Param(schemaPipe(GetEmailThreadMessagesParamSchema))
    { threadId }: TGetEmailThreadMessagesParam,
  ): Promise<TGetEmailThreadMessagesResponse> {
    const result = await this.queryBus.execute(
      new GetEmailThreadMessagesQuery(threadId),
    );
    return EmailThreadsResponseMapper.toResponse(result);
  }

  @Post('send-email')
  async sendEmail(
    @Body() emailData: SendEmailRequest,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.commandBus.execute(
        new SendEmailCommand(
          emailData.to,
          emailData.subject,
          emailData.body,
          emailData.from,
        ),
      );

      return {
        success: true,
        message: 'Email sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to send email: ${error.message}`,
      };
    }
  }

  @Post('send-reply')
  async sendReply(
    @Body() replyData: SendReplyRequest,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.commandBus.execute(
        new SendReplyCommand(
          replyData.to,
          replyData.subject,
          replyData.body,
          replyData.threadId,
          replyData.inReplyTo,
          replyData.references,
        ),
      );

      return {
        success: true,
        message: 'Reply sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to send reply: ${error.message}`,
      };
    }
  }

  @Post('send-rfq-confirmation')
  async sendRfqConfirmation(
    @Body() confirmationData: SendRfqConfirmationRequest,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.commandBus.execute(
        new SendRfqConfirmationEmailCommand(
          confirmationData.threadId,
          confirmationData.to,
          confirmationData.customerName || null,
          confirmationData.rfqSummary || null,
          confirmationData.items || null,
          confirmationData.emailType,
          confirmationData.subject,
          confirmationData.inReplyTo || null,
          confirmationData.references || null,
        ),
      );

      return {
        success: true,
        message: 'RFQ confirmation email sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to send RFQ confirmation email: ${error.message}`,
      };
    }
  }
}
