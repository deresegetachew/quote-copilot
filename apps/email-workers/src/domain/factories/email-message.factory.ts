import { gmail_v1 } from 'googleapis';
import { EmailMessageAggregate } from '../entities/emailMessage.aggregate';
import { EmailEntity } from '../entities/email.entity';
import { EmailThreadStatusVO } from '../valueObjects/emailThreadStatus.vo';
import { DateTime } from 'luxon';

type EmailBodies = {
  plainText?: string;
  html?: string;
};
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
    const { html, plainText } = EmailMessageFactory.extractBody(payload);
    const receivedAt = DateTime.fromMillis(
      parseInt(gmailMessage.internalDate || '0', 10),
    );

    const body = html || plainText || '';

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

    return new EmailMessageAggregate(
      null,
      threadId,
      [email],
      EmailThreadStatusVO.initial(),
    );
  }

  private static extractBody(payload: any): EmailBodies {
    const result: EmailBodies = {};

    const walkParts = (parts: any[]) => {
      for (const part of parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          result.plainText = decodeBase64(part.body.data);
        } else if (part.mimeType === 'text/html' && part.body?.data) {
          result.html = decodeBase64(part.body.data);
        }

        if (part.parts) {
          walkParts(part.parts);
        }
      }
    };

    const decodeBase64 = (encoded: string): string => {
      return Buffer.from(encoded, 'base64').toString('utf-8');
    };

    if (payload.mimeType?.startsWith('text/') && payload.body?.data) {
      if (payload.mimeType === 'text/plain') {
        result.plainText = decodeBase64(payload.body.data);
      } else if (payload.mimeType === 'text/html') {
        result.html = decodeBase64(payload.body.data);
      }
    } else if (payload.parts) {
      walkParts(payload.parts);
    }

    return result;
  }
}
