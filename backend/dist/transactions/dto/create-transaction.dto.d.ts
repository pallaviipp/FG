import { TransactionType } from '../schemas/transaction.schema';
export declare class CreateTransactionDto {
    client: string;
    type: TransactionType;
    amount: number;
    description: string;
    date?: string;
    billed?: boolean;
}
