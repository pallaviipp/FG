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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const transaction_schema_1 = require("./schemas/transaction.schema");
const clients_service_1 = require("../clients/clients.service");
let TransactionsService = class TransactionsService {
    constructor(transactionModel, clientsService) {
        this.transactionModel = transactionModel;
        this.clientsService = clientsService;
    }
    async create(createTransactionDto) {
        const amount = createTransactionDto.type === transaction_schema_1.TransactionType.DEBIT
            ? createTransactionDto.amount
            : -createTransactionDto.amount;
        await this.clientsService.updateBalance(createTransactionDto.client, amount);
        const createdTransaction = new this.transactionModel({
            ...createTransactionDto,
            client: new mongoose_2.Types.ObjectId(createTransactionDto.client)
        });
        return createdTransaction.save();
    }
    async findAll() {
        return this.transactionModel.find().populate('client').exec();
    }
    async findByClient(clientId) {
        return this.transactionModel.find({ client: new mongoose_2.Types.ObjectId(clientId) }).populate('client').exec();
    }
    async findUnbilled() {
        return this.transactionModel.find({ billed: false }).populate('client').exec();
    }
    async markAsBilled(transactionIds) {
        await this.transactionModel.updateMany({ _id: { $in: transactionIds.map(id => new mongoose_2.Types.ObjectId(id)) } }, { $set: { billed: true } });
    }
};
TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(transaction_schema_1.Transaction.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        clients_service_1.ClientsService])
], TransactionsService);
exports.TransactionsService = TransactionsService;
//# sourceMappingURL=transactions.service.js.map