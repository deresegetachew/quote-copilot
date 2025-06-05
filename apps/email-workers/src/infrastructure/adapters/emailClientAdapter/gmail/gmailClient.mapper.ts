import { gmail_v1 } from 'googleapis';
import { EmailMessageDTO } from '../../../../application/ports/outgoing/dto/emailMessage.dto';

type EmailBodies = {
  plainText?: string;
  html?: string;
};

type AttachmentMetaData = {
  attachmentId: string;
  fileName: string;
  mimeType: string;
};

export class GmailClientMapper {
  static toEmailMessageDTO(email: any): EmailMessageDTO {
    const instance = new GmailClientMapper();
    return instance.mapToEmailMessageDTO(email);
  }

  private mapToEmailMessageDTO(
    email: gmail_v1.Schema$Message,
  ): EmailMessageDTO {
    const threadId = this.getThreadId(email);
    const messageId = this.getMessageId(email);
    const from = this.getFrom(email);
    const to = this.getTo(email);
    const subject = this.getSubject(email);
    const body = this.getBody(email);
    const receivedAt = new Date(parseInt(email.internalDate || '0', 10));
    const attachments = this.getAttachments(email);

    return new EmailMessageDTO(
      messageId,
      threadId,
      from,
      to,
      subject,
      body.plainText || body.html || '',
      receivedAt,
      attachments,
    );
  }

  private getThreadId(payload: gmail_v1.Schema$Message): string {
    return payload.threadId || '';
  }

  private getMessageId(payload: gmail_v1.Schema$Message): string {
    return payload.id || '';
  }

  private getFrom(gmailMessage: gmail_v1.Schema$Message): string {
    const payload = gmailMessage.payload;

    return (
      payload.headers.find((header: any) => header.name === 'From')?.value || ''
    );
  }

  private getTo(gmailMessage: gmail_v1.Schema$Message): string {
    const payload = gmailMessage.payload;
    return (
      payload.headers.find((header: any) => header.name === 'To')?.value || ''
    );
  }

  private getSubject(gmailMessage: gmail_v1.Schema$Message): string {
    const payload = gmailMessage.payload;

    return (
      payload.headers.find((header: any) => header.name === 'Subject')?.value ||
      ''
    );
  }

  private getBody(gmailMessage: gmail_v1.Schema$Message): EmailBodies {
    const payload = gmailMessage.payload;

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

  private getAttachments(
    gmailMessage: gmail_v1.Schema$Message,
  ): AttachmentMetaData[] {
    const payload = gmailMessage.payload;
    const attachments: any[] = [];

    const walkParts = (parts: gmail_v1.Schema$MessagePart[]) => {
      for (const part of parts) {
        if (
          part.filename &&
          part.filename.length > 0 &&
          part.body?.attachmentId
        ) {
          attachments.push({
            attachmentId: part.body.attachmentId,
            fileName: part.filename || 'unknown',
            mimeType: part.mimeType || 'application/octet-stream',
          });
        }

        if (part.parts) {
          walkParts(part.parts);
        }
      }
    };

    if (payload.parts) {
      walkParts(payload.parts);
    } else if (
      payload.filename &&
      payload.filename.length > 0 &&
      payload.body?.attachmentId
    ) {
      attachments.push({
        attachmentId: payload.body.attachmentId,
        fileName: payload.filename,
        mimeType: payload.mimeType || 'application/octet-stream',
      });
    }

    return attachments;
  }
}
