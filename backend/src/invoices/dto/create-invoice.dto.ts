import { IsString, IsNumber, IsEnum, IsArray, IsDateString, IsMongoId, IsOptional } from 'class-validator';
import { InvoiceStatus } from '../schemas/invoice.schema';

class InvoiceItemDto {
  @IsString()
  description: string;

  @IsNumber()
  amount: number;
}

export class CreateInvoiceDto {
  @IsString()
  invoiceNumber: string;

  @IsMongoId()
  client: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  transactions?: string[];

  @IsArray()
  @IsOptional()
  items?: InvoiceItemDto[];

  @IsNumber()
  total: number;

  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @IsDateString()
  date: string;
}
