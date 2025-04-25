export class EmailThreadResponseDTO {
  id: string; // thread ID in mongodb
  threadId: string; // thread ID mongodb
  status: string; // thread status
  emails: Array<EmailMessageResponseDTO>; // list of emails in the thread
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
