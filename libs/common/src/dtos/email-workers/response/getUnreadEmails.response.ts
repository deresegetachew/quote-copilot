import { z } from 'zod';
import { AttachmentParsingStatus } from '../../../valueObjects';

const GetUnreadEmailsAttachmentSchema = z.object({
  id: z.string().min(1, 'Attachment ID is required'),
  threadId: z.string().min(1, 'Thread ID is required'),
  messageId: z.string().min(1, 'Message ID is required'),
  attachmentId: z.string().min(1, 'Attachment ID in email is required'),
  fileName: z.string().min(1, 'File name is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  status: z.nativeEnum(AttachmentParsingStatus),
});

const GetUnreadEmailsMessageSchema = z.object({
  id: z.string().min(1, 'Message ID is required'),
  messageId: z.string().min(1, 'Email message ID is required'),
  threadId: z.string().min(1, 'Thread ID is required'),
  subject: z.string(),
  from: z.string().email('Invalid sender email address'),
  to: z.string().email('Invalid recipient email address'),
  body: z.string(),
  receivedAt: z.date(),
});

export const GetUnreadEmailsResponseSchema = z
  .object({
    id: z.string().min(1, 'Thread ID is required'),
    threadId: z.string().min(1, 'MongoDB thread ID is required'),
    status: z.string().min(1, 'Thread status is required'),
    emails: z.array(GetUnreadEmailsMessageSchema),
    attachments: z.array(GetUnreadEmailsAttachmentSchema),
  })
  .strict();

export type TGetUnreadEmailsResponse = z.infer<
  typeof GetUnreadEmailsResponseSchema
>;
