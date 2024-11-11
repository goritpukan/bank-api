import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { BankAccountModule } from '../bank-account/bank-account.module';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [BankAccountModule, CurrencyModule],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
