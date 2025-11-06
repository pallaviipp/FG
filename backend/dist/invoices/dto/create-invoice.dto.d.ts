import { InvoiceStatus } from '../schemas/invoice.schema';
declare class InvoiceItemDto {
    description: string;
    amount: number;
}
export declare class CreateInvoiceDto {
    invoiceNumber: string;
    client: string;
    transactions?: string[];
    items?: InvoiceItemDto[];
    total: number;
    status?: InvoiceStatus;
    date: string;
}
export {};
