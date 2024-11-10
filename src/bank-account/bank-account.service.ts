import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { Currency, Role } from '@prisma/client';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';

@Injectable()
export class BankAccountService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async create(userId: number, createBankAccountDto: CreateBankAccountDto) {
    const user = await this.userService.findOne(userId);
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

  async findOne(id: number, user: any) {
    const account = await this.prisma.bankAccount.findUnique({ where: { id } });
    this.checkAccessToAccount(account, user);
    return account;
  }

  async remove(id: number, user: any) {
    const account = await this.prisma.bankAccount.findUnique({ where: { id } });
    this.checkAccessToAccount(account, user);
    return this.prisma.bankAccount.delete({ where: { id } });
  }

  async block(id: number, user: any) {
    const account = await this.prisma.bankAccount.findUnique({ where: { id } });
    this.checkAccessToAccount(account, user);
    return this.prisma.bankAccount.update({
      where: { id },
      data: { isBlocked: true },
    });
  }

  async unblock(id: number, user: any) {
    const account = await this.prisma.bankAccount.findUnique({ where: { id } });
    this.checkAccessToAccount(account, user);
    return this.prisma.bankAccount.update({
      where: { id },
      data: { isBlocked: false },
    });
  }

  private generateAccountNumber(latestNumber: string | undefined): string {
    const bankIdentifier: number = 1234;
    let uniqueNumber: number = 111111111111;
    if (!latestNumber) return `${bankIdentifier}${uniqueNumber}`;
    return `${bankIdentifier}${+latestNumber.replace('1234', '') + 1}`;
  }

  private checkAccessToAccount(account: any, user: any): void {
    if (!account) throw new NotFoundException('Account not found');
    if (account.userId !== user.id && user.role != Role.ADMIN) {
      throw new ForbiddenException('You dont have access');
    }
  }
}
