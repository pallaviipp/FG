import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionDocument, TransactionType } from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ClientsService } from '../clients/clients.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    private clientsService: ClientsService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const amount = createTransactionDto.type === TransactionType.DEBIT 
      ? createTransactionDto.amount 
      : -createTransactionDto.amount;

    // Update client balance
    await this.clientsService.updateBalance(createTransactionDto.client, amount);

    const createdTransaction = new this.transactionModel({
      ...createTransactionDto,
      client: new Types.ObjectId(createTransactionDto.client)
    });
    return createdTransaction.save();
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionModel.find().populate('client').exec();
  }

  async findByClient(clientId: string): Promise<Transaction[]> {
    return this.transactionModel.find({ client: new Types.ObjectId(clientId) }).populate('client').exec();
  }

  async findUnbilled(): Promise<Transaction[]> {
    return this.transactionModel.find({ billed: false }).populate('client').exec();
  }

  async markAsBilled(transactionIds: string[]): Promise<void> {
    await this.transactionModel.updateMany(
      { _id: { $in: transactionIds.map(id => new Types.ObjectId(id)) } },
      { $set: { billed: true } },
    );
  }
}
