import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './schemas/transaction.schema';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(@Body() createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  async findAll(): Promise<Transaction[]> {
    return this.transactionsService.findAll();
  }

  @Get('client/:clientId')
  async findByClient(@Param('clientId') clientId: string): Promise<Transaction[]> {
    return this.transactionsService.findByClient(clientId);
  }

  @Get('unbilled')
  async findUnbilled(): Promise<Transaction[]> {
    return this.transactionsService.findUnbilled();
  }
}
