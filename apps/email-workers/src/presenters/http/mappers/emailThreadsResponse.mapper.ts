import { EmailMessageAggregate } from '../../../domain/entities/emailMessage.aggregate';
import { EmailThreadResponseDTO } from '../../../../../../libs/common/src/dtos/emailThreads.response.dto';

export class EmailThreadsResponseMapper {
  static toResponse(
    emailThreads: EmailMessageAggregate,
  ): EmailThreadResponseDTO {
    return {
      id: emailThreads.getStorageId(),
      threadId: emailThreads.getThreadId(),
      status: emailThreads.getStatus().getValue(),
      emails: emailThreads.getEmails().map((email) => ({
        id: email.getStorageId(),
        messageId: email.getMessageId(),
        threadId: email.getThreadId(),
        subject: email.getSubject(),
        from: email.getFrom(),
        to: email.getTo(),
        body: email.getBody(),
        receivedAt: email.getReceivedAt(),
      })),
    };
  }
}
