import { Module } from '@nestjs/common';
import { EmailMessageRepositoryAdapter } from './emailMessageRepository.adapter';
import { EmailMessageRepositoryPort } from '../../../application/ports/outgoing/emailMessageRepository.port';
import { MongooseModule } from '@nestjs/mongoose';
import { Email, EmailSchema } from '../../database/mongo/schemas/email.schema';
import {
  Thread,
  ThreadSchema,
} from '../../database/mongo/schemas/thread.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Email.name, schema: EmailSchema },
      { name: Thread.name, schema: ThreadSchema },
    ]),
  ],
  providers: [
    EmailMessageRepositoryAdapter,
    {
      provide: EmailMessageRepositoryPort,
      useClass: EmailMessageRepositoryAdapter,
    },
  ],
  exports: [EmailMessageRepositoryPort],
})
export class MongooseAdapterModule {}
