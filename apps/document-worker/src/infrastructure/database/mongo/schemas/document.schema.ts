import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class DocumentSchema {
  @Prop({ required: true, unique: true })
  documentId: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true, type: Buffer })
  content: Buffer;

  @Prop({ required: true, type: Object })
  metadata: {
    size: number;
    uploadedBy?: string;
    originalPath?: string;
    [key: string]: any;
  };

  @Prop({
    required: true,
    enum: ['pending', 'processing', 'processed', 'failed'],
  })
  status: string;

  @Prop({ type: String })
  extractedText?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export type DocumentDocument = DocumentSchema & Document;
export const DocumentSchemaFactory =
  SchemaFactory.createForClass(DocumentSchema);

// Create indexes for better performance
DocumentSchemaFactory.index({ documentId: 1 });
DocumentSchemaFactory.index({ fileName: 1 });
DocumentSchemaFactory.index({ mimeType: 1 });
DocumentSchemaFactory.index({ status: 1 });
DocumentSchemaFactory.index({ createdAt: 1 });
DocumentSchemaFactory.index({ updatedAt: 1 });
