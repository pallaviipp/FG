/// <reference types="node" />
/// <reference types="node" />
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument, InvoiceStatus } from './schemas/invoice.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { TransactionsService } from '../transactions/transactions.service';
export declare class InvoicesService {
    private invoiceModel;
    private transactionsService;
    constructor(invoiceModel: Model<InvoiceDocument>, transactionsService: TransactionsService);
    create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice>;
    findAll(): Promise<Invoice[]>;
    findOne(id: string): Promise<Invoice>;
    updateStatus(id: string, status: InvoiceStatus): Promise<Invoice>;
    generateExcel(startDate?: Date, endDate?: Date, clientId?: string): Promise<Buffer>;
}
