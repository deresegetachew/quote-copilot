import { Injectable } from '@nestjs/common';
import {
  EmailClientFactoryPort,
  EmailClientPort,
} from '../../../application/ports/outgoing/emailClient.port';
import { GmailClient } from './gmail/gmail.client';
import { EMAIL_CLIENTS_ENUM } from './emailClients.enum';

@Injectable()
export class EmailClientAdapterFactory implements EmailClientFactoryPort {
  constructor(private readonly gmailClient: GmailClient) {}

  getClient(provider: string): EmailClientPort {
    switch (provider) {
      case EMAIL_CLIENTS_ENUM.GMAIL:
        return this.gmailClient;
      default:
        throw new Error('Unsupported email client provider');
    }
  }
}
