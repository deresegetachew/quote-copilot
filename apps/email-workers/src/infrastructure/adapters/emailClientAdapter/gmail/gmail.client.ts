import { google, gmail_v1 } from 'googleapis';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { GmailAuth } from './gmail.auth';
import { EmailClientPort } from '../../../../application/ports/outgoing/emailClient.port';
import { EmailMessageAggregate } from '../../../../domain/entities/emailMessage.aggregate';

import { EmailMessageFactory } from '../../../../domain/factories/email-message.factory';

@Injectable()
export class GmailClient extends EmailClientPort implements OnModuleInit {
  private gmail: gmail_v1.Gmail;

  constructor(private readonly gmailAuth: GmailAuth) {
    super();
  }

  async onModuleInit() {
    await this.initialize();
  }

  private async initialize(): Promise<void> {
    const auth = await this.gmailAuth.getOAuth2Client();
    this.gmail = google.gmail({ version: 'v1', auth });
  }

  async getUnreadMessages(): Promise<EmailMessageAggregate[]> {
    const res = await this.gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
      maxResults: 1,
    });

    const messages = res.data.messages || [];
    const emailMessages: EmailMessageAggregate[] = [];

    for (const message of messages) {
      if (message.id) {
        const email = await this.getMessageById(message.id);
        emailMessages.push(email);
      }
    }

    return emailMessages;
  }

  async getMessageById(messageId: string): Promise<EmailMessageAggregate> {
    const res = await this.gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });

    const gmailMessage = res.data;
    return EmailMessageFactory.createFromGmailMessage(gmailMessage);
  }

  async getMessagesByThreadId(
    threadId: string,
  ): Promise<EmailMessageAggregate[]> {
    const res = await this.gmail.users.threads.get({
      userId: 'me',
      id: threadId,
    });

    const messages = res.data.messages || [];
    return messages.map((msg) =>
      EmailMessageFactory.createFromGmailMessage(msg),
    );
  }

  async searchByQuery(query: string): Promise<EmailMessageAggregate[]> {
    const res = await this.gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 10,
    });

    const messages = res.data.messages || [];
    const aggregates: EmailMessageAggregate[] = [];

    for (const message of messages) {
      if (message.id) {
        const msg = await this.gmail.users.messages.get({
          userId: 'me',
          id: message.id,
        });
        aggregates.push(EmailMessageFactory.createFromGmailMessage(msg.data));
      }
    }

    return aggregates;
  }
}
