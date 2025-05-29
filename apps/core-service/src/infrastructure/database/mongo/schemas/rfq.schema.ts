import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CustomerDetail, CustomerDetailSchema } from './customerDetail.schema';
import { RFQLineItem, RFQLineItemSchema } from './rfqLineItem.schema';

@Schema()
export class RFQ {
  @Prop({ required: true })
  threadId: string;

  @Prop({ type: String })
  status: string;

  @Prop({ required: true })
  summary: string;

  @Prop({ type: CustomerDetailSchema, _id: false })
  customerDetail: CustomerDetail;

  @Prop({ type: Date, default: null })
  expectedDeliveryDate: Date | null;

  @Prop({ type: Boolean, default: null })
  hasAttachments: boolean | null;

  @Prop({ type: [String], default: null })
  notes: string[] | null;

  @Prop({ type: [RFQLineItemSchema], default: [] })
  lineItems: RFQLineItem[];

  @Prop({
    type: String,
    default: null,
  })
  reason: string | null;

  @Prop({ type: [String], default: null })
  error: string[] | null;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export type RFQDocument = RFQ & Document;
export const RFQSchema = SchemaFactory.createForClass(RFQ);

RFQSchema.index({ threadId: 1 });
RFQSchema.index({ status: 1 });

RFQSchema.index({ 'customerDetail.email': 1 });
RFQSchema.index({ notes: 'text' });

RFQSchema.index({ 'lineItems.itemCode': 1 });
RFQSchema.index({ 'lineItems.itemDescription': 'text' });

RFQSchema.index({ createdAt: 1 });
RFQSchema.index({ updatedAt: 1 });
