import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConnectionFactory } from './connection.factory';
import { Attachment, AttachmentSchema } from './schemas/attachment.schema';
import { Email, EmailSchema } from './schemas/email.schema';
import { Thread, ThreadSchema } from './schemas/thread.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongooseConnectionFactory,
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Email.name, schema: EmailSchema },
      { name: Thread.name, schema: ThreadSchema },
      { name: Attachment.name, schema: AttachmentSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
