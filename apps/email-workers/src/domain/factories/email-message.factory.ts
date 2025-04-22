import { gmail_v1 } from 'googleapis';
import { EmailMessageAggregate } from '../entities/emailMessage.aggregate';
import { EmailEntity } from '../entities/email.entity';
import { EmailThreadStatusVO } from '../valueObjects/emailThreadStatus.vo';
import { DateTime } from 'luxon';

export class EmailMessageFactory {
  static createFromGmailMessage(
    gmailMessage: gmail_v1.Schema$Message,
  ): EmailMessageAggregate {
    const payload = gmailMessage.payload;
    const headers = payload.headers;

    const threadId = gmailMessage.threadId || '';
    const messageId = gmailMessage.id || '';
    const from =
      headers.find((header: any) => header.name === 'From')?.value || '';
    const to = headers.find((header: any) => header.name === 'To')?.value || '';
    const subject =
      headers.find((header: any) => header.name === 'Subject')?.value || '';
    const body = this.extractBody(payload);
    const receivedAt = DateTime.fromMillis(
      parseInt(gmailMessage.internalDate || '0', 10),
    );

    const email = new EmailEntity({
      messageId,
      threadId,
      from,
      to,
      subject,
      body,
      receivedAt,
    });

    return new EmailMessageAggregate(
      threadId,
      [email],
      EmailThreadStatusVO.initial(),
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
