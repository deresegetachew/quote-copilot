import { MessageThreadAggregate } from '../entities/messageThread.aggregate';
import { EmailEntity } from '../entities/email.entity';
import { EmailThreadStatusVO } from '../valueObjects/emailThreadStatus.vo';
import { AttachmentEntity } from '../entities/attachment.entity';
import { EmailMessageDTO } from '../../application/ports/outgoing/dto/emailMessage.dto';

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
      id: null,
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
          attachmentId: att.attachmentId,
          threadId,
          messageId,
          fileName: att.fileName,
          mimeType: att.mimeType || 'application/octet-stream',
        }),
    );
    return new MessageThreadAggregate(
      null,
      threadId,
      [email],
      attachmentEntities,
      EmailThreadStatusVO.initial(),
    );
  }
}
