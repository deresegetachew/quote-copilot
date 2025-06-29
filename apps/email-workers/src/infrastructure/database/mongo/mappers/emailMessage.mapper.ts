import { MessageThreadAggregate } from '../../../../domain/entities/messageThread.aggregate';
import { EmailEntity } from '../../../../domain/entities/email.entity';
import { EmailThreadStatusVO } from '../../../../domain/valueObjects/emailThreadStatus.vo';
import { EmailDocument } from '../schemas/email.schema';
import { ThreadDocument } from '../schemas/thread.schema';
import { AttachmentDocument } from '../schemas/attachment.schema';
import { AttachmentEntity } from '../../../../domain/entities/attachment.entity';
import { AttachmentMapper } from './attachment.mapper';
import { ID } from '@common';
import { MessageThreadFactory } from '../../../../domain/factories/messageThread.factory';

export class EmailMessageMapper {
  static toDomainMessageThreadAgg(
    thread: ThreadDocument,
    emails: EmailDocument[],
    attachments: AttachmentDocument[] = [],
  ): MessageThreadAggregate {
    const emailEntities: EmailEntity[] = emails.map(
      (doc) =>
        new EmailEntity({
          id: ID.of(doc.id),
          messageId: doc.messageId,
          threadId: doc.threadId,
          from: doc.from,
          to: doc.to,
          subject: doc.subject,
          body: doc.body,
          receivedAt: doc.receivedAt,
        }),
    );

    const attachmentEntities: AttachmentEntity[] = attachments.map(
      (attachment) => AttachmentMapper.toDomain(attachment),
    );

    const statusVO = EmailThreadStatusVO.of(thread.status);

    return new MessageThreadAggregate(
      ID.of(thread._id),
      thread.threadId,
      emailEntities,
      attachmentEntities,
      statusVO,
    );
  }

  static toDomainEmail(doc: EmailDocument): EmailEntity {
    return new EmailEntity({
      id: ID.of(doc._id),
      messageId: doc.messageId,
      threadId: doc.threadId,
      from: doc.from,
      to: doc.to,
      subject: doc.subject,
      body: doc.body,
      receivedAt: doc.receivedAt,
    });
  }

  static toPersistenceEmail(email: EmailEntity): Partial<EmailDocument> {
    return {
      _id: email.getStorageId().getValue(),
      messageId: email.getMessageId(),
      threadId: email.getThreadId(),
      from: email.getFrom(),
      to: email.getTo(),
      subject: email.getSubject(),
      body: email.getBody(),
      receivedAt: email.getReceivedAt(),
    };
  }

  static toPersistenceThread(
    aggregate: MessageThreadAggregate,
  ): Partial<ThreadDocument> {
    return {
      _id: aggregate.getStorageId().getValue(),
      threadId: aggregate.getThreadId(),
      messageIds: aggregate.getEmails().map((e) => e.getMessageId()),
      status: aggregate.getStatus().getValue(),
    };
  }

  static toPersistenceEmails(
    aggregate: MessageThreadAggregate,
  ): Partial<EmailDocument>[] {
    return aggregate.getEmails().map(this.toPersistenceEmail);
  }
}
