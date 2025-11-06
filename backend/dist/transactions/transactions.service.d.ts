import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ClientsService } from '../clients/clients.service';
export declare class TransactionsService {
    private transactionModel;
    private clientsService;
    constructor(transactionModel: Model<TransactionDocument>, clientsService: ClientsService);
    create(createTransactionDto: CreateTransactionDto): Promise<Transaction>;
    findAll(): Promise<Transaction[]>;
    findByClient(clientId: string): Promise<Transaction[]>;
    findUnbilled(): Promise<Transaction[]>;
    markAsBilled(transactionIds: string[]): Promise<void>;
}
