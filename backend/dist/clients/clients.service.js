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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const client_schema_1 = require("./schemas/client.schema");
const transaction_schema_1 = require("../transactions/schemas/transaction.schema");
let ClientsService = class ClientsService {
    constructor(clientModel, transactionModel) {
        this.clientModel = clientModel;
        this.transactionModel = transactionModel;
    }
    async create(createClientDto) {
        const createdClient = new this.clientModel(createClientDto);
        return createdClient.save();
    }
    async findAll() {
        return this.clientModel.find().sort({ createdAt: -1 }).exec();
    }
    async findOne(id) {
        const client = await this.clientModel.findById(id).exec();
        if (!client) {
            throw new common_1.NotFoundException('Client not found');
        }
        return client;
    }
    async update(id, updateClientDto) {
        const client = await this.clientModel
            .findByIdAndUpdate(id, updateClientDto, { new: true })
            .exec();
        if (!client) {
            throw new common_1.NotFoundException('Client not found');
        }
        return client;
    }
    async remove(id) {
        const result = await this.clientModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException('Client not found');
        }
    }
    async updateBalance(clientId, amount) {
        return this.clientModel.findByIdAndUpdate(clientId, { $inc: { balance: amount } }, { new: true });
    }
    async getClientStatement(clientId) {
        const client = await this.clientModel.findById(clientId);
        if (!client) {
            throw new common_1.NotFoundException('Client not found');
        }
        const transactions = await this.transactionModel
            .find({ client: new mongoose_2.Types.ObjectId(clientId) })
            .sort({ date: -1 })
            .exec();
        const invoices = await this.transactionModel
            .find({ client: new mongoose_2.Types.ObjectId(clientId), billed: true })
            .sort({ date: -1 })
            .exec();
        return {
            client,
            transactions,
            invoices,
            summary: {
                totalTransactions: transactions.length,
                totalInvoiced: invoices.reduce((sum, inv) => sum + inv.amount, 0),
                currentBalance: client.balance,
            },
        };
    }
};
ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(client_schema_1.Client.name)),
    __param(1, (0, mongoose_1.InjectModel)(transaction_schema_1.Transaction.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ClientsService);
exports.ClientsService = ClientsService;
//# sourceMappingURL=clients.service.js.map