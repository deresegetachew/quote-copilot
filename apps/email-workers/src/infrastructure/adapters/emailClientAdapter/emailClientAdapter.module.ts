import { Module } from '@nestjs/common';
import { GmailAuth } from './gmail/gmail.auth';
import { GmailClient } from './gmail/gmail.client';
import { EmailClientAdapterFactory } from './emailClientAdapter.factory';
import { EmailClientFactoryPort } from '../../../application/ports/outgoing/emailClient.port';

@Module({
  imports: [],
  providers: [
    GmailClient,
    GmailAuth,

    {
      provide: EmailClientFactoryPort,
      useClass: EmailClientAdapterFactory,
    },
  ],
  exports: [GmailClient, EmailClientFactoryPort],
})
export class EmailClientAdapterModule {}
