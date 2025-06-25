import { MessageThreadAggregate } from '../entities/messageThread.aggregate';
import { EmailEntity } from '../entities/email.entity';
import { EmailThreadStatusVO } from '../valueObjects/emailThreadStatus.vo';
import { AttachmentEntity } from '../entities/attachment.entity';
import { EmailMessageDTO } from '../../application/ports/outgoing/dto/emailMessage.dto';
import { ID } from '@common';

export class MessageThreadFactory {
  static createFromEmailMessageDTO(
    messageDTO: EmailMessageDTO,
  ): MessageThreadAggregate {
    const {
      messageId,
      threadId,
      from,
      to,
      subject,
      body,
      receivedAt,
      attachments,
    } = messageDTO;

    const email = new EmailEntity({
      id: ID.create(),
      messageId,
      threadId,
      from,
      to,
      subject,
      body,
      receivedAt,
    });

    const attachmentEntities = attachments.map(
      (att) =>
        new AttachmentEntity({
          id: ID.create(),
          attachmentId: att.attachmentId,
          threadId,
          messageId,
          fileName: att.fileName,
          mimeType: att.mimeType || 'application/octet-stream',
        }),
    );

    return new MessageThreadAggregate(
      ID.create(),
      threadId,
      [email],
      attachmentEntities,
      EmailThreadStatusVO.initial(),
    );
  }
}
