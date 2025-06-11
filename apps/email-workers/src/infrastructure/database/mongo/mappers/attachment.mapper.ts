import { ID } from '@common';
import { AttachmentEntity } from '../../../../domain/entities/attachment.entity';
import { MessageThreadAggregate } from '../../../../domain/entities/messageThread.aggregate';
import { AttachmentDocument } from '../schemas/attachment.schema';

export class AttachmentMapper {
  static toDomain(doc: AttachmentDocument): AttachmentEntity {
    return new AttachmentEntity({
      id: ID.of(doc.id),
      messageId: doc.messageId,
      threadId: doc.threadId,
      fileName: doc.fileName,
      mimeType: doc.mimeType,
      attachmentId: doc.attachmentId,
    });
  }

  static toPersistenceAttachment(
    aggregate: AttachmentEntity,
  ): Partial<AttachmentDocument> {
    return {
      _id: aggregate.getId().getValue(),
      messageId: aggregate.getMessageId(),
      threadId: aggregate.getThreadId(),
      fileName: aggregate.getFileName(),
      mimeType: aggregate.getMimeType(),
      attachmentId: aggregate.getAttachmentId(),
    };
  }

  static toPersistenceAttachments(
    aggregate: MessageThreadAggregate,
  ): Partial<AttachmentDocument>[] {
    return aggregate
      .getAttachments()
      .map((attachment) => this.toPersistenceAttachment(attachment));
  }
}
