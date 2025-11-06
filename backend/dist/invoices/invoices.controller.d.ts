import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Invoice, InvoiceStatus } from './schemas/invoice.schema';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice>;
    findAll(): Promise<Invoice[]>;
    findOne(id: string): Promise<Invoice>;
    updateStatus(id: string, status: InvoiceStatus): Promise<Invoice>;
    exportExcel(startDate: string, endDate: string, clientId: string, res: Response): Promise<void>;
}
