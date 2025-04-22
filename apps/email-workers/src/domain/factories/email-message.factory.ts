import { EmailMessage } from '../entities/email-message.entity';

export class EmailMessageFactory {
  static createFromGmailMessage(gmailMessage: any): EmailMessage {
    const payload = gmailMessage.payload;
    const headers = payload.headers;

    const threadId = gmailMessage.threadId || '';
    const messageId = gmailMessage.id || '';
    const from =
      headers.find((header: any) => header.name === 'From')?.value || '';
    const subject =
      headers.find((header: any) => header.name === 'Subject')?.value || '';
    const body = this.extractBody(payload);
    const receivedAt = new Date(parseInt(gmailMessage.internalDate, 10));

    return new EmailMessage(
      threadId,
      messageId,
      from,
      subject,
      body,
      receivedAt,
    );
  }

  private static extractBody(payload: any): string {
    if (payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      }
    }

    return '';
  }
}
