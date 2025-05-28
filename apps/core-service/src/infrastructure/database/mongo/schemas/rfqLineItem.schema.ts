import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CustomerDetail, CustomerDetailSchema } from './customerDetail.schema';

@Schema({ _id: true })
export class RFQLineItem {
  @Prop({ required: true })
  itemCode: string;

  @Prop({ required: false, default: null })
  itemDescription: string | null;

  @Prop({ required: false, default: null })
  quantity: number | null;

  @Prop({ required: false, default: null })
  unit: string | null;

  @Prop({ required: false, default: null })
  notes: string | null;
}

export type RFQLineItemDocument = RFQLineItem & Document;
export const RFQLineItemSchema = SchemaFactory.createForClass(RFQLineItem);
