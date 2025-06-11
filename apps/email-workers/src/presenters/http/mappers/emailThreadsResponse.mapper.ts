import { TGetEmailThreadMessagesResponse } from '@common/dtos';
import { MessageThreadAggregate } from '../../../domain/entities/messageThread.aggregate';

export class EmailThreadsResponseMapper {
  static toResponse(
    emailThreads: MessageThreadAggregate,
  ): TGetEmailThreadMessagesResponse {
    return {
      id: emailThreads.getStorageId().getValue(),
      threadId: emailThreads.getThreadId(),
      status: emailThreads.getStatus().getValue(),
      emails: emailThreads.getEmails().map((email) => ({
        id: email.getStorageId().getValue(),
        messageId: email.getMessageId(),
        threadId: email.getThreadId(),
        subject: email.getSubject() || '',
        from: email.getFrom(),
        to: email.getTo(),
        body: email.getBody() || '',
        receivedAt: email.getReceivedAt(),
      })),
      attachments: emailThreads
        .getAttachments(emailThreads.getThreadId())
        .map((attachment) => ({
          id: attachment.getId().getValue(),
          threadId: attachment.getThreadId(),
          messageId: attachment.getMessageId(),
          attachmentId: attachment.getAttachmentId(),
          fileName: attachment.getFileName(),
          mimeType: attachment.getMimeType(),
          status: attachment.getStatus().getValue(),
        })),
    };
  }
}
