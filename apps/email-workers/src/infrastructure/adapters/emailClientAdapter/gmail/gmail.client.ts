import { google, gmail_v1 } from 'googleapis';
import { GaxiosResponse } from 'gaxios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { GmailAuth } from './gmail.auth';
import { EmailClientPort } from '../../../../application/ports/outgoing/emailClient.port';

import { EmailMessageDTO } from '../../../../application/ports/outgoing/dto/emailMessage.dto';
import { GmailClientMapper } from './gmailClient.mapper';

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
    await this.initializeLabelsOrThrow();
  }

  async getUnreadMessagesOrThrow(): Promise<EmailMessageDTO[]> {
    const res = await this.gmail.users.messages.list({
      userId: 'me',
      q: '-label:agent-read',
      maxResults: 1,
    });

    if (res && res.status !== 200) {
      throw new Error(`Failed to fetch messages: ${res.statusText}`);
    }

    const messages = res.data.messages || [];
    const emailMessages: EmailMessageDTO[] = [];

    for (const message of messages) {
      if (message.id) {
        const email = await this.getMessageByIdOrThrow(message.id);
        emailMessages.push(email);
      }
    }

    return emailMessages;
  }

  async getMessageByIdOrThrow(messageId: string): Promise<EmailMessageDTO> {
    const res = await this.gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    if (res && res.status !== 200) {
      throw new Error(`Failed to fetch message: ${res.statusText}`);
    }

    return GmailClientMapper.toEmailMessageDTO(res.data);
  }

  async getMessagesByThreadIdOrThrow(
    threadId: string,
  ): Promise<EmailMessageDTO[]> {
    const res = await this.gmail.users.threads.get({
      userId: 'me',
      id: threadId,
    });

    if (res && res.status !== 200) {
      throw new Error(`Failed to fetch thread: ${res.statusText}`);
    }

    const messages = res.data.messages || [];
    return messages.map((msg) => GmailClientMapper.toEmailMessageDTO(msg));
  }

  async getMessageAttachmentByIdOrThrow(
    messageId: string,
    attachmentId: string,
  ): Promise<Buffer> {
    const res = await this.gmail.users.messages.attachments.get({
      userId: 'me',
      messageId,
      id: attachmentId,
    });

    if (res && res.status !== 200) {
      throw new Error(`Failed to fetch attachment: ${res.statusText}`);
    }

    if (res.data.data) {
      return Buffer.from(res.data.data, 'base64');
    } else {
      throw new Error('Attachment data not found');
    }
  }

  async searchByQueryOrThrow(query: string): Promise<EmailMessageDTO[]> {
    const res = await this.gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 10,
    });

    if (res && res.status !== 200) {
      throw new Error(`Failed to search messages: ${res.statusText}`);
    }

    const messages = res.data.messages || [];
    const aggregates: EmailMessageDTO[] = [];

    for (const message of messages) {
      if (message.id) {
        const msg = await this.gmail.users.messages.get({
          userId: 'me',
          id: message.id,
        });
        aggregates.push(GmailClientMapper.toEmailMessageDTO(msg.data));
      }
    }

    return aggregates;
  }

  async markMessagesAsAgentReadOrThrow(messageIds: string[]): Promise<void> {
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

  private async initializeLabelsOrThrow() {
    this.labels = await this.gmail.users.labels.list({ userId: 'me' });
    const exists = this.labels.data.labels?.some(
      (label) => label.name === this.agentReadLabelName,
    );
    if (!exists) {
      await this.createLabelOrThrow(this.agentReadLabelName);
    }
  }

  private async createLabelOrThrow(labelName: string): Promise<void> {
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
