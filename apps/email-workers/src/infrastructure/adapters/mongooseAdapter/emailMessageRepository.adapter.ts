import { InjectModel } from '@nestjs/mongoose';
import { EmailMessageRepositoryPort } from '../../../application/ports/outgoing/emailMessageRepository.port';
import {
  Thread,
  ThreadDocument,
} from '../../database/mongo/schemas/thread.schema';
import {
  Email,
  EmailDocument,
} from '../../database/mongo/schemas/email.schema';
import { Model } from 'mongoose';
import { MessageThreadAggregate } from '../../../domain/entities/messageThread.aggregate';
import { EmailMessageMapper } from '../../database/mongo/mappers/emailMessage.mapper';
import { PaginatedData } from '@common';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailMessageRepositoryAdapter extends EmailMessageRepositoryPort {
  private logger = new Logger(EmailMessageRepositoryAdapter.name);

  constructor(
    @InjectModel(Email.name)
    private readonly emailModel: Model<EmailDocument>,
    @InjectModel(Thread.name)
    private readonly threadModel: Model<ThreadDocument>,
  ) {
    super();
  }

  // Note to future self:
  // when we introduce transactions, and unit of work, we can use the same session for both models
  // and make sure that both operations are atomic
  // but for now, we will just use the upsert option
  // to make sure that if the document does not exist, it will be created
  // and if it exists, it will be updated
  async save(emailMessage: MessageThreadAggregate): Promise<void> {
    const threadData = EmailMessageMapper.toPersistenceThread(emailMessage);
    const emailsData = EmailMessageMapper.toPersistenceEmails(emailMessage);

    await this.threadModel.updateOne(
      { threadId: threadData.threadId },
      { $set: threadData },
      { upsert: true },
    );

    for (const email of emailsData) {
      await this.emailModel.updateOne(
        { messageId: email.messageId },
        { $set: email },
        { upsert: true },
      );
    }
  }

  async findByThreadId(
    threadId: string,
  ): Promise<MessageThreadAggregate | null> {
    const threadDoc = await this.threadModel.findOne({ threadId }).exec();
    if (!threadDoc) {
      return null;
    }

    const emails = await this.emailModel
      .find({ messageId: { $in: threadDoc.messageIds } })
      .exec();

    return EmailMessageMapper.toDomain(threadDoc, emails);
  }

  async searchByFields(
    filters: Partial<{
      subject: string;
      body: string;
      from: string;
      to: string;
      receivedAt: Date;
      status: string;
    }>,
  ): Promise<PaginatedData<MessageThreadAggregate>> {
    const {
      subject,
      body,
      from,
      to,
      receivedAt,
      status,
      page = 1,
      pageSize = 10,
    } = filters as any;

    const query: any = {};

    if (subject) query.subject = { $regex: subject, $options: 'i' };
    if (status) query.status = status;
    if (receivedAt) query.createdAt = { $gte: receivedAt };

    const threadDocs = await this.threadModel
      .find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const totalCount = await this.threadModel.countDocuments(query);

    const results: MessageThreadAggregate[] = [];

    for (const thread of threadDocs) {
      const emailQuery: any = { messageId: { $in: thread.messageIds } };
      if (body) emailQuery.body = { $regex: body, $options: 'i' };
      if (from) emailQuery.from = { $regex: from, $options: 'i' };
      if (to) emailQuery.to = { $regex: to, $options: 'i' };

      const emails = await this.emailModel.find(emailQuery).exec();

      if (emails.length) {
        results.push(EmailMessageMapper.toDomain(thread, emails));
      }
    }

    return {
      data: results,
      totalCount,
      page,
      pageSize,
    };
  }
}
