import { google, gmail_v1 } from 'googleapis';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { GmailAuth } from './gmail.auth';
import { EmailClientPort } from '../../../../application/ports/outgoing/emailClient.port';
import { EmailMessage } from '../../../../domain/entities/email-message.entity';
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

  async initialize(): Promise<void> {
    const auth = await this.gmailAuth.getOAuth2Client();
    this.gmail = google.gmail({ version: 'v1', auth });
  }

  async getUnreadMessages(): Promise<EmailMessage[]> {
    const res = await this.gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
      maxResults: 10,
    });

    const messages = res.data.messages || [];
    const emailMessages: EmailMessage[] = [];

    for (const message of messages) {
      if (message.id) {
        const email = await this.getMessageById(message.id);
        emailMessages.push(email);
      }
    }

    return emailMessages;
  }

  async getMessageById(messageId: string): Promise<EmailMessage> {
    const res = await this.gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });

    return EmailMessageFactory.createFromGmailMessage(res.data);
  }
}
