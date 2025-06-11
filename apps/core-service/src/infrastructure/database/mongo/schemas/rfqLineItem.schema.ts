import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CustomerDetail, CustomerDetailSchema } from './customerDetail.schema';

export class RFQLineItem {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true })
  itemCode: string;

  @Prop({ type: String, required: false, default: null })
  itemDescription: string | null;

  @Prop({ type: Number, required: false, default: null })
  quantity: number | null;

  @Prop({ type: String, required: false, default: null })
  unit: string | null;

  @Prop({ type: [String], required: false, default: null })
  notes: string[] | null;
}

export type RFQLineItemDocument = RFQLineItem & Document;
export const RFQLineItemSchema = SchemaFactory.createForClass(RFQLineItem);
