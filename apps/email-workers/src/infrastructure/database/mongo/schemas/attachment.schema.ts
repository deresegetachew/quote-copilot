import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AttachmentParsingStatus } from '../../../../../../../libs/common/src/valueObjects/attachmentParsingStatus.vo';
import { Document } from 'mongoose';

@Schema()
export class Attachment {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true })
  messageId: string;

  @Prop({ required: true })
  threadId: string;

  @Prop({ required: true })
  attachmentId: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  status: AttachmentParsingStatus;
}

export type AttachmentDocument = Attachment & Document;
export const AttachmentSchema = SchemaFactory.createForClass(Attachment);
