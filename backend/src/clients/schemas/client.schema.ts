import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClientDocument = Client & Document;

@Schema()
export class Client {
  @Prop({ required: true })
  name: string;

  @Prop()
  wechatId: string;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
