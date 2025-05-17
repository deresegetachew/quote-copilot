import { Injectable, Logger, Scope } from '@nestjs/common';
import { AbstractPromptBuilder } from '../../promptBuilder.abstract';

type TContext = {
  tenantName: string; // tenant name
  id: string; // thread ID in mongodb
  threadId: string; // thread ID mongodb
  status: string; // thread status
  emails: Array<Message>; // list of emails in the thread
  responseSchema: string; // schema string for the prompt
};

type Message = {
  id: string; // message ID in mongodb
  messageId: string; // message ID in email
  threadId: string; // thread ID in mongodb
  subject: string; // subject of the email
  from: string; // sender email address
  to: string; // recipient email addresses // this should probably be an array for future
  body: string; // body of the email
  receivedAt: Date; // date when the email was received
};

@Injectable({ scope: Scope.TRANSIENT })
export class ParseCustomerRFQEmailPromptBuilder extends AbstractPromptBuilder<TContext> {
  logger = new Logger(ParseCustomerRFQEmailPromptBuilder.name);

  protected setTemplateFolderPath(): this {
    this.templateFolder = 'parseCustomerRFQEmail';

    this.logger.log('Template folder path:', {
      templateFolder: this.templateFolder,
    });

    return this;
  }

  protected setTemperature(): this {
    this.prompt.temperature = 0.1;
    return this;
  }

  protected setTone(): this {
    this.prompt.tone = 'professional';
    return this;
  }

  protected setAudience(): this {
    this.prompt.audience = 'procurement team';
    return this;
  }

  protected setTemplateVariables(): this {
    this.prompt.templateVariables = {
      tenantName: this.context.tenantName,
      id: this.context.id,
      threadId: this.context.threadId,
      status: this.context.status,
      emails: this.context.emails.map((email) => ({
        id: email.id,
        messageId: email.messageId,
        threadId: email.threadId,
        subject: email.subject,
        from: email.from,
        to: email.to,
        body: email.body,
        receivedAt: email.receivedAt,
      })),
      responseSchema: this.context.responseSchema,
    };

    return this;
  }

  protected setMaxTokens(): this {
    this.prompt.maxTokens = 2048; // this should be large, maybe we need a token counter
    return this;
  }
}
