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
import { Attachment } from '../../database/mongo/schemas/attachment.schema';
import { EmailEntity } from '../../../domain/entities/email.entity';

@Injectable()
export class EmailMessageRepositoryAdapter extends EmailMessageRepositoryPort {
  private logger = new Logger(EmailMessageRepositoryAdapter.name);

  constructor(
    @InjectModel(Email.name)
    private readonly emailModel: Model<EmailDocument>,
    @InjectModel(Thread.name)
    private readonly threadModel: Model<ThreadDocument>,
    @InjectModel(Attachment.name)
    private readonly attachmentModel: Model<Attachment>,
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

    await this.threadModel.replaceOne(
      { threadId: threadData.threadId },
      threadData,
      { upsert: true },
    );

    for (const email of emailsData) {
      await this.emailModel.replaceOne({ messageId: email.messageId }, email, {
        upsert: true,
      });
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

    const attachments = await this.attachmentModel
      .find({
        threadId: threadDoc.threadId,
      })
      .exec();

    return EmailMessageMapper.toDomainMessageThreadAgg(
      threadDoc,
      emails,
      attachments,
    );
  }

  async findByThreadIds(
    threadIds: string[],
  ): Promise<Map<string, MessageThreadAggregate>> {
    const result = new Map<string, MessageThreadAggregate>();

    if (threadIds.length === 0) {
      return result;
    }

    // Fetch all threads in one query
    const threadDocs = await this.threadModel
      .find({ threadId: { $in: threadIds } })
      .exec();

    if (threadDocs.length === 0) {
      return result;
    }

    // Collect all message IDs from all threads
    const allMessageIds = threadDocs.flatMap((thread) => thread.messageIds);

    const emails = await this.emailModel
      .find({ messageId: { $in: allMessageIds } })
      .exec();

    const attachments = await this.attachmentModel
      .find({ threadId: { $in: threadIds } })
      .exec();

    // Group emails and attachments by thread
    const emailsByThread = new Map<string, any[]>();
    const attachmentsByThread = new Map<string, any[]>();

    emails.forEach((email) => {
      const threadId = email.threadId;
      if (!emailsByThread.has(threadId)) {
        emailsByThread.set(threadId, []);
      }
      emailsByThread.get(threadId)!.push(email);
    });

    attachments.forEach((attachment) => {
      const threadId = attachment.threadId;
      if (!attachmentsByThread.has(threadId)) {
        attachmentsByThread.set(threadId, []);
      }
      attachmentsByThread.get(threadId)!.push(attachment);
    });

    // Create aggregates for each thread
    for (const threadDoc of threadDocs) {
      const threadEmails = emailsByThread.get(threadDoc.threadId) || [];
      const threadAttachments =
        attachmentsByThread.get(threadDoc.threadId) || [];

      const aggregate = EmailMessageMapper.toDomainMessageThreadAgg(
        threadDoc,
        threadEmails,
        threadAttachments,
      );

      result.set(threadDoc.threadId, aggregate);
    }

    return result;
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
  ): Promise<PaginatedData<EmailEntity>> {
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

    const results: EmailEntity[] = [];

    const emailQuery: any = {};
    if (body) emailQuery.body = { $regex: body, $options: 'i' };
    if (from) emailQuery.from = { $regex: from, $options: 'i' };
    if (to) emailQuery.to = { $regex: to, $options: 'i' };

    const totalCount = await this.emailModel.countDocuments(emailQuery).exec();
    if (totalCount === 0) {
      return {
        data: [],
        totalCount: 0,
        page,
        pageSize,
      };
    }

    const emails = await this.emailModel
      .find(emailQuery)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    if (emails.length) {
      results.push(
        ...emails.map((emailDoc) => EmailMessageMapper.toDomainEmail(emailDoc)),
      );
    }

    return {
      data: results,
      totalCount,
      page,
      pageSize,
    };
  }
}
