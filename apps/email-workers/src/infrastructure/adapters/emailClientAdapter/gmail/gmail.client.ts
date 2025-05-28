import { google, gmail_v1 } from 'googleapis';
import { GaxiosResponse } from 'gaxios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { GmailAuth } from './gmail.auth';
import { EmailClientPort } from '../../../../application/ports/outgoing/emailClient.port';
import { EmailMessageAggregate } from '../../../../domain/entities/emailMessage.aggregate';

import { EmailMessageFactory } from '../../../../domain/factories/email-message.factory';

@Injectable()
export class GmailClient extends EmailClientPort implements OnModuleInit {
  private gmail: gmail_v1.Gmail;
  private labels: GaxiosResponse<gmail_v1.Schema$ListLabelsResponse>;
  private agentReadLabelName = 'agent-read';

  constructor(private readonly gmailAuth: GmailAuth) {
    super();
  }

  async onModuleInit() {
    await this.initialize();
  }

  private async initialize(): Promise<void> {
    const auth = await this.gmailAuth.getOAuth2Client();
    this.gmail = google.gmail({ version: 'v1', auth });
    await this.initializeLabels();
  }

  async getUnreadMessages(): Promise<EmailMessageAggregate[]> {
    const res = await this.gmail.users.messages.list({
      userId: 'me',
      q: '-label:agent-read',
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
      format: 'full',
    });

    return EmailMessageFactory.createFromGmailMessage(res.data);
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

  async markMessagesAsAgentRead(messageIds: string[]): Promise<void> {
    const labelObj = this.labels.data.labels?.filter(
      (label) => label.name === this.agentReadLabelName,
    );

    await this.gmail.users.messages.batchModify({
      userId: 'me',
      requestBody: {
        ids: messageIds,
        addLabelIds: labelObj ? labelObj.map((l) => l.id) : [],
      },
    });
  }

  private async initializeLabels() {
    this.labels = await this.gmail.users.labels.list({ userId: 'me' });
    const exists = this.labels.data.labels?.some(
      (label) => label.name === this.agentReadLabelName,
    );
    if (!exists) {
      await this.createLabel(this.agentReadLabelName);
    }
  }

  private async createLabel(labelName: string): Promise<void> {
    await this.gmail.users.labels.create({
      userId: 'me',
      requestBody: {
        name: labelName,
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show',
      },
    });
  }
}
