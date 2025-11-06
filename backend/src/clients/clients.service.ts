import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Client, ClientDocument } from './schemas/client.schema';
import { CreateClientDto } from './dto/create-client.dto';
import { Transaction } from '../transactions/schemas/transaction.schema';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<any>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const createdClient = new this.clientModel(createClientDto);
    return createdClient.save();
  }

  async findAll(): Promise<Client[]> {
    return this.clientModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientModel.findById(id).exec();
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }

  async update(id: string, updateClientDto: CreateClientDto): Promise<Client> {
    const client = await this.clientModel
      .findByIdAndUpdate(id, updateClientDto, { new: true })
      .exec();
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }

  async remove(id: string): Promise<void> {
    const result = await this.clientModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Client not found');
    }
  }

  async updateBalance(clientId: string, amount: number): Promise<Client> {
    return this.clientModel.findByIdAndUpdate(
      clientId,
      { $inc: { balance: amount } },
      { new: true },
    );
  }

  async getClientStatement(clientId: string) {
    const client = await this.clientModel.findById(clientId);
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const transactions = await this.transactionModel
      .find({ client: new Types.ObjectId(clientId) })
      .sort({ date: -1 })
      .exec();

    const invoices = await this.transactionModel
      .find({ client: new Types.ObjectId(clientId), billed: true })
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
}