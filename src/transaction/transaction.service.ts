import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BankAccountService } from '../bank-account/bank-account.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { TransactionType } from '@prisma/client';
import { CurrencyService } from '../currency/currency.service';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bankAccountService: BankAccountService,
    private readonly currencyService: CurrencyService,
  ) {}

  async createTransfer(createTransferDto: CreateTransferDto, user: any) {
    const sourceAccount = await this.bankAccountService.findOne(
      createTransferDto.sourceAccountNumber,
      user,
    );
    const destinationAccount = await this.prismaService.bankAccount.findUnique({
      where: { accountNumber: createTransferDto.destinationAccountNumber },
    });
    if (!destinationAccount)
      throw new NotFoundException('Destination account does not exist');

    if (sourceAccount.balance < createTransferDto.transferAmount) {
      throw new UnprocessableEntityException(
        'There are not enough funds in your account to perform this transaction',
      );
    }

    let transferAmount: number = createTransferDto.transferAmount;
    if (sourceAccount.currency !== destinationAccount.currency) {
      transferAmount = await this.currencyService.convert(
        sourceAccount.currency,
        destinationAccount.currency,
        createTransferDto.transferAmount,
      );
    }
    await this.prismaService.bankAccount.update({
      where: {
        accountNumber: createTransferDto.sourceAccountNumber,
      },
      data: {
        balance: sourceAccount.balance - createTransferDto.transferAmount,
      },
    });
    await this.prismaService.bankAccount.update({
      where: {
        accountNumber: createTransferDto.destinationAccountNumber,
      },
      data: {
        balance: destinationAccount.balance + transferAmount,
      },
    });
    return this.prismaService.transaction.create({
      data: {
        sourceAccount: {
          connect: { id: sourceAccount.id },
        },
        destinationAccount: {
          connect: { id: destinationAccount.id },
        },
        currency: sourceAccount.currency,
        amount: createTransferDto.transferAmount,
        convertedCurrency: destinationAccount.currency,
        convertedAmount: transferAmount,
        transactionType: TransactionType.TRANSFER,
      },
    });
  }
}
