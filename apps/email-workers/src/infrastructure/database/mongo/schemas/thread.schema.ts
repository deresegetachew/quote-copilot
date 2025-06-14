import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EmailThreadStatus } from '../../../../domain/valueObjects/emailThreadStatus.vo';

@Schema()
export class Thread {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true, unique: true })
  threadId: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ type: [String] })
  messageIds: string[];

  @Prop({ type: String, enum: EmailThreadStatus })
  status: EmailThreadStatus;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export type ThreadDocument = Thread & Document;
export const ThreadSchema = SchemaFactory.createForClass(Thread);

ThreadSchema.index({ status: 1 });
// Add unique index on threadId to prevent duplicates
ThreadSchema.index({ threadId: 1 }, { unique: true });
