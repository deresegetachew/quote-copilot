import { AttachmentParsingStatus } from '../valueObjects/attachmentParsingStatus.vo';

export class EmailThreadResponseDTO {
  id: string; // thread ID in mongodb
  threadId: string; // thread ID mongodb
  status: string; // thread status
  emails: Array<EmailMessageResponseDTO>; // list of emails in the thread
  attachments: Array<AttachmentsResponseDTO>; // list of attachments in the thread
}

class EmailMessageResponseDTO {
  id: string; // message ID in mongodb
  messageId: string; // message ID in email
  threadId: string; // thread ID in mongodb
  subject: string; // subject of the email
  from: string; // sender email address
  to: string; // recipient email addresses // this should probably be an array for future
  body: string; // body of the email
  receivedAt: Date; // date when the email was received
}

class AttachmentsResponseDTO {
  id: string; // attachment ID in mongodb
  threadId: string; // thread ID in mongodb
  messageId: string; // message ID in email
  attachmentId: string; // unique ID of the attachment in the email
  fileName: string; // name of the attachment file
  mimeType: string; // MIME type of the attachment
  status: AttachmentParsingStatus;
}
