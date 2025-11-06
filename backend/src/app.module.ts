import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { ClientsModule } from './clients/clients.module';
import { TransactionsModule } from './transactions/transactions.module';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/fusion-global-accounting'),
    ClientsModule,
    TransactionsModule,
    InvoicesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}