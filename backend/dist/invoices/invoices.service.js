"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const invoice_schema_1 = require("./schemas/invoice.schema");
const transactions_service_1 = require("../transactions/transactions.service");
const Excel = require("exceljs");
let InvoicesService = class InvoicesService {
    constructor(invoiceModel, transactionsService) {
        this.invoiceModel = invoiceModel;
        this.transactionsService = transactionsService;
    }
    async create(createInvoiceDto) {
        if (createInvoiceDto.transactions && createInvoiceDto.transactions.length > 0) {
            await this.transactionsService.markAsBilled(createInvoiceDto.transactions);
        }
        const createdInvoice = new this.invoiceModel({
            ...createInvoiceDto,
            client: new mongoose_2.Types.ObjectId(createInvoiceDto.client),
            transactions: createInvoiceDto.transactions?.map(id => new mongoose_2.Types.ObjectId(id)) || [],
            date: new Date(createInvoiceDto.date)
        });
        return createdInvoice.save();
    }
    async findAll() {
        return this.invoiceModel.find().populate('client').exec();
    }
    async findOne(id) {
        return this.invoiceModel.findById(id).populate('client').exec();
    }
    async updateStatus(id, status) {
        return this.invoiceModel.findByIdAndUpdate(id, { status }, { new: true }).populate('client').exec();
    }
    async generateExcel(startDate, endDate, clientId) {
        const query = {};
        if (startDate || endDate) {
            query.date = {};
            if (startDate)
                query.date.$gte = startDate;
            if (endDate)
                query.date.$lte = endDate;
        }
        if (clientId) {
            query.client = new mongoose_2.Types.ObjectId(clientId);
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
                client: invoice.client.name,
                date: invoice.date.toISOString().split('T')[0],
                total: invoice.total,
                status: invoice.status,
            });
        });
        return workbook.xlsx.writeBuffer();
    }
};
InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(invoice_schema_1.Invoice.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        transactions_service_1.TransactionsService])
], InvoicesService);
exports.InvoicesService = InvoicesService;
//# sourceMappingURL=invoices.service.js.map