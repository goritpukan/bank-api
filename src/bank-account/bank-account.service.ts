import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { Currency, Role } from '@prisma/client';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { CurrencyService } from '../currency/currency.service';

@Injectable()
export class BankAccountService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private currencyService: CurrencyService,
  ) {}

  async create(userId: number, createBankAccountDto: CreateBankAccountDto) {
    const user = await this.userService.findOne(userId);
    if (user.isBlocked) throw new ForbiddenException('You are blocked');
    if (!user) throw new NotFoundException('User does not exist');
    const latestAccount = await this.prisma.bankAccount.findFirst({
      orderBy: { accountNumber: 'desc' },
    });

    return this.prisma.bankAccount.create({
      data: {
        accountNumber: this.generateAccountNumber(latestAccount?.accountNumber),
        user: {
          connect: { id: userId },
        },
        ...(createBankAccountDto.currency && {
          currency: Currency[createBankAccountDto.currency],
        }),
      },
    });
  }

  async findAll(userId: number, user: any) {
    if (user.id != userId && user.role != Role.ADMIN)
      throw new ForbiddenException('You dont have access');
    const accounts = await this.prisma.bankAccount.findMany({
      where: { userId: userId },
    });
    if (!accounts?.length) throw new NotFoundException('Account not found');
    return accounts;
  }

  async findOne(accountNumber: string, user: any) {
    const account = await this.prisma.bankAccount.findUnique({ where: { accountNumber } });
    this.checkAccessToAccount(account, user);
    return account;
  }

  async getBalance(accountNumber: string, currency: Currency, user: any): Promise<string> {
    const account = await this.prisma.bankAccount.findUnique({ where: { accountNumber } });
    this.checkAccessToAccount(account, user);
    if (!account) throw new NotFoundException('Account not found');
    if (account.currency === currency) {
      return `Balance of your account:(${account.accountNumber}) in ${currency} is ${account.balance} ${currency}`;
    }
    const convertedBalance = await this.currencyService.convert(account.currency, currency, account.balance)
    return `Balance of your account:(${account.accountNumber}) in ${currency} is ${convertedBalance} ${currency}`;
  }

  async remove(accountNumber: string, user: any) {
    await this.checkUserBlock(user);
    const account = await this.prisma.bankAccount.findUnique({ where: { accountNumber } });
    this.checkAccessToAccount(account, user);
    return this.prisma.bankAccount.delete({ where: { accountNumber } });
  }

  async block(accountNumber: string, user: any) {
    await this.checkUserBlock(user);
    const account = await this.prisma.bankAccount.findUnique({ where: { accountNumber } });
    this.checkAccessToAccount(account, user);
    return this.prisma.bankAccount.update({
      where: { accountNumber },
      data: { isBlocked: true },
    });
  }

  async unblock(accountNumber: string, user: any) {
    await this.checkUserBlock(user);
    const account = await this.prisma.bankAccount.findUnique({ where: { accountNumber } });
    this.checkAccessToAccount(account, user);
    return this.prisma.bankAccount.update({
      where: { accountNumber },
      data: { isBlocked: false },
    });
  }

  private generateAccountNumber(latestNumber: string | undefined): string {
    const bankIdentifier: number = 1234;
    let uniqueNumber: number = 111111111111;
    if (!latestNumber) return `${bankIdentifier}${uniqueNumber}`;
    return `${bankIdentifier}${+latestNumber.replace('1234', '') + 1}`;
  }

  checkAccessToAccount(account: any, user: any): void {
    if (!account) throw new NotFoundException('Account not found');
    if (account.userId !== user.id && user.role != Role.ADMIN) {
      throw new ForbiddenException('You dont have access');
    }
  }

  async checkUserBlock(reqUser: any): Promise<void> {
    if (reqUser.role === Role.ADMIN) return;
    const user = await this.prisma.user.findUnique({
      where: { id: reqUser.id },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.isBlocked) throw new ForbiddenException('You are blocked');
  }
}
