import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice, InvoiceDocument, InvoiceStatus } from './schemas/invoice.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { TransactionsService } from '../transactions/transactions.service';
import * as Excel from 'exceljs';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    private transactionsService: TransactionsService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    if (createInvoiceDto.transactions && createInvoiceDto.transactions.length > 0) {
      await this.transactionsService.markAsBilled(createInvoiceDto.transactions);
    }

    const createdInvoice = new this.invoiceModel({
      ...createInvoiceDto,
      client: new Types.ObjectId(createInvoiceDto.client),
      transactions: createInvoiceDto.transactions?.map(id => new Types.ObjectId(id)) || [],
      date: new Date(createInvoiceDto.date)
    });
    return createdInvoice.save();
  }

  async findAll(): Promise<Invoice[]> {
    return this.invoiceModel.find().populate('client').exec();
  }

  async findOne(id: string): Promise<Invoice> {
    return this.invoiceModel.findById(id).populate('client').exec();
  }

  async updateStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    return this.invoiceModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    ).populate('client').exec();
  }

  async generateExcel(startDate?: Date, endDate?: Date, clientId?: string): Promise<Buffer> {
    const query: any = {};
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }
    
    if (clientId) {
      query.client = new Types.ObjectId(clientId);
    }

    const invoices = await this.invoiceModel.find(query).populate('client').exec();

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Invoices');

    worksheet.columns = [
      { header: 'Invoice Number', key: 'invoiceNumber', width: 15 },
      { header: 'Client', key: 'client', width: 20 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Total', key: 'total', width: 12 },
      { header: 'Status', key: 'status', width: 10 },
    ];

    invoices.forEach(invoice => {
      worksheet.addRow({
        invoiceNumber: invoice.invoiceNumber,
        client: (invoice.client as any).name,
        date: invoice.date.toISOString().split('T')[0],
        total: invoice.total,
        status: invoice.status,
      });
    });

    return workbook.xlsx.writeBuffer() as Promise<Buffer>;
  }
}
