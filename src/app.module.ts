import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { BankAccountModule } from './bank-account/bank-account.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TransactionModule } from './transaction/transaction.module';
import { CurrencyModule } from './currency/currency.module';
import { DepositModule } from './deposit/deposit.module';

@Module({
  imports: [UserModule, BankAccountModule, AuthModule, PrismaModule, TransactionModule, CurrencyModule, DepositModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule {}
