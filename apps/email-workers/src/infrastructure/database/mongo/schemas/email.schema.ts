import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Email {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true })
  messageId: string;

  @Prop({ required: true })
  threadId: string;

  @Prop()
  subject: string;

  @Prop()
  body: string;

  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  to: string;

  @Prop()
  receivedAt: Date;
}

export type EmailDocument = Email & Document;
export const EmailSchema = SchemaFactory.createForClass(Email);
