import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
}

// Define InvoiceItem as a separate schema
@Schema({ _id: false })
export class InvoiceItem {
  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  amount: number;
}

export const InvoiceItemSchema = SchemaFactory.createForClass(InvoiceItem);

@Schema()
export class Invoice {
  @Prop({ required: true, unique: true })
  invoiceNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Client', required: true })
  client: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Transaction' }] })
  transactions: Types.ObjectId[];

  @Prop({ type: [InvoiceItemSchema] }) // Use the schema here
  items: InvoiceItem[];

  @Prop({ required: true })
  total: number;

  @Prop({ required: true, enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  @Prop({ required: true })
  date: Date;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);