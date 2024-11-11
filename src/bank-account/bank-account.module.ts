import { Module } from '@nestjs/common';
import { BankAccountService } from './bank-account.service';
import { BankAccountController } from './bank-account.controller';
import { UserModule } from '../user/user.module';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [UserModule, CurrencyModule],
  controllers: [BankAccountController],
  providers: [BankAccountService],
  exports: [BankAccountService],
})
export class BankAccountModule {}
