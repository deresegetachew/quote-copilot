import { EmailMessageAggregate } from '../../../../domain/entities/emailMessage.aggregate';
import { EmailEntity } from '../../../../domain/entities/email.entity';
import { EmailThreadStatusVO } from '../../../../domain/valueObjects/emailThreadStatus.vo';
import { EmailDocument } from '../schemas/email.schema';
import { ThreadDocument } from '../schemas/thread.schema';

export class EmailMessageMapper {
  static toDomain(
    thread: ThreadDocument,
    emails: EmailDocument[],
  ): EmailMessageAggregate {
    const emailEntities: EmailEntity[] = emails.map(
      (doc) =>
        new EmailEntity({
          messageId: doc.messageId,
          threadId: doc.threadId,
          from: doc.from,
          to: doc.to,
          subject: doc.subject,
          body: doc.body,
          receivedAt: doc.receivedAt,
        }),
    );

    const statusVO = EmailThreadStatusVO.of(thread.status);

    return EmailMessageAggregate.fromPersistence(
      thread.threadId,
      emailEntities,
      statusVO,
    );
  }

  static toPersistenceEmail(email: EmailEntity): Partial<EmailDocument> {
    return {
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
    aggregate: EmailMessageAggregate,
  ): Partial<ThreadDocument> {
    return {
      threadId: aggregate.getThreadId(),
      messageIds: aggregate.getEmails().map((e) => e.getMessageId()),
      status: aggregate.getStatus().getValue(),
    };
  }

  static toPersistenceEmails(
    aggregate: EmailMessageAggregate,
  ): Partial<EmailDocument>[] {
    return aggregate.getEmails().map(this.toPersistenceEmail);
  }
}
