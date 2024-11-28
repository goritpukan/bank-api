import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BankAccountService } from '../bank-account/bank-account.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { Role, TransactionType } from '@prisma/client';
import { CurrencyService } from '../currency/currency.service';
import { Decimal } from 'decimal.js';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bankAccountService: BankAccountService,
    private readonly currencyService: CurrencyService,
  ) {}

  async createTransfer(createTransferDto: CreateTransferDto, user: any) {
    await this.bankAccountService.checkUserBlock(user);
    const sourceAccount = await this.bankAccountService.findOne(
      createTransferDto.sourceAccountNumber,
      user,
    );
    if (sourceAccount.isBlocked)
      throw new ForbiddenException('Account is blocked');
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

    let transferAmount: Decimal = new Decimal(createTransferDto.transferAmount);
    let convertedTransferAmount: Decimal;
    let isConverted: boolean = false;
    if (sourceAccount.currency !== destinationAccount.currency) {
      const rawConvertedTransferAmount = await this.currencyService.convert(
        sourceAccount.currency,
        destinationAccount.currency,
        createTransferDto.transferAmount,
      );
      convertedTransferAmount = new Decimal(rawConvertedTransferAmount);
      isConverted = true;
    }

    await this.prismaService.bankAccount.update({
      where: {
        accountNumber: createTransferDto.sourceAccountNumber,
      },
      data: {
        balance: new Decimal(sourceAccount.balance)
          .minus(transferAmount)
          .toNumber(),
      },
    });
    await this.prismaService.bankAccount.update({
      where: {
        accountNumber: createTransferDto.destinationAccountNumber,
      },
      data: {
        balance: isConverted
          ? new Decimal(destinationAccount.balance)
              .plus(convertedTransferAmount)
              .toNumber()
          : new Decimal(destinationAccount.balance)
              .plus(transferAmount)
              .toNumber(),
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
        amount: transferAmount.toNumber(),
        convertedCurrency: isConverted ? destinationAccount.currency : null,
        convertedAmount: isConverted
          ? convertedTransferAmount.toNumber()
          : null,
        transactionType: TransactionType.TRANSFER,
      },
    });
  }

  async createTransaction(
    accountNumber: string,
    user: any,
    createTransactionDto: CreateTransactionDto,
  ) {
    await this.bankAccountService.checkUserBlock(user);
    const bankAccount = await this.bankAccountService.findOne(
      accountNumber,
      user,
    );
    if (bankAccount.isBlocked)
      throw new ForbiddenException('Account is blocked');

    const decimalBalance = new Decimal(bankAccount.balance);
    const decimalTransferAmount = new Decimal(
      createTransactionDto.transferAmount,
    );

    const newBalance =
      createTransactionDto.transactionType === 'DEPOSIT'
        ? decimalBalance.plus(decimalTransferAmount).toNumber()
        : decimalBalance.minus(decimalTransferAmount).toNumber();

    await this.prismaService.bankAccount.update({
      where: { accountNumber },
      data: { balance: newBalance },
    });
    return this.prismaService.transaction.create({
      data: {
        amount: createTransactionDto.transferAmount,
        currency: bankAccount.currency,
        transactionType: createTransactionDto.transactionType,
        destinationAccountId: bankAccount.id,
      },
    });
  }

  async getTransactions(id: number, user: any) {
    if (user.id != id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('You dont have access');
    }
    const transactions = await this.prismaService.transaction.findMany({
      where: {
        OR: [
          {
            sourceAccount: {
              userId: id,
            },
          },
          {
            destinationAccount: {
              userId: id,
            },
          },
        ],
      },
      include: {
        sourceAccount: {
          select: {
            accountNumber: true,
            currency: true,
          },
        },
        destinationAccount: {
          select: {
            accountNumber: true,
            currency: true,
          },
        },
      },
    });
    if (!transactions.length)
      throw new NotFoundException('No transactions found');
  }
}
