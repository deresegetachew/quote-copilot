import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class CustomerDetail {
  @Prop({ type: String, nullable: true, default: null })
  name: string;

  @Prop({ type: String, required: true })
  email: string;
}

export const CustomerDetailSchema =
  SchemaFactory.createForClass(CustomerDetail);
