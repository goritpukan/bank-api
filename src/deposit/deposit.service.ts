import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateDepositDto } from './dto/update-deposit.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { Decimal } from 'decimal.js';
import { Role } from '@prisma/client';
import { UpdateInterestDto } from './dto/update-interest-dto';

@Injectable()
export class DepositService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async create(reqUser: any, createDepositDto: CreateDepositDto) {
    const user = await this.userService.findOne(reqUser.id);
    if (user.isBlocked) throw new ForbiddenException('You are blocked');
    return this.prismaService.deposit.create({
      data: {
        user: { connect: { id: user.id } },
        currency: createDepositDto.currency,
      },
    });
  }

  async findAll(user: any, userId: number) {
    if (user.id !== userId && user.role !== Role.ADMIN) {
      throw new ForbiddenException('You dont have access');
    }
    const deposits = await this.prismaService.deposit.findMany({
      where: { userId: userId },
    });
    if (!deposits.length) throw new NotFoundException('No deposits found');
    return deposits;
  }

  async getAmount(user: any, id: number) {
    const deposit = await this.prismaService.deposit.findUnique({
      where: { id },
    });
    this.checkAccessToDeposit(deposit, user);

    const decimalBalance: Decimal = new Decimal(deposit.balance);
    const decimalInterestRate: Decimal = new Decimal(deposit.interestRate);
    const decimalInterest: Decimal = decimalBalance
      .times(decimalInterestRate)
      .dividedBy(100);

    const finalAmount: number = decimalBalance.plus(decimalInterest).toNumber();
    return `Deposit amount after interest(${deposit.interestRate}%) is accrued = ${finalAmount}${deposit.currency}`;
  }

  async update(id: number, reqUser: any, updateDepositDto: UpdateDepositDto) {
    const user = await this.userService.findOne(reqUser.id);
    if (user.isBlocked) throw new ForbiddenException('You are blocked');

    const deposit = await this.prismaService.deposit.findUnique({
      where: { id },
    });
    this.checkAccessToDeposit(deposit, reqUser);
    const decimalBalance: Decimal = new Decimal(deposit.balance);
    const decimalAmount: Decimal = new Decimal(updateDepositDto.amount);
    const newBalance: number = decimalBalance.plus(decimalAmount).toNumber();

    return this.prismaService.deposit.update({
      where: { id },
      data: { balance: newBalance },
    });
  }

  updateInterestRate(id: number, updateInterestDto: UpdateInterestDto) {
    return this.prismaService.deposit.update({
      where: { id },
      data: { interestRate: updateInterestDto.interestRate },
    });
  }

  async remove(id: number, reqUser: any) {
    const user = await this.userService.findOne(reqUser.id);
    if (user.isBlocked) throw new ForbiddenException('You are blocked');

    const deposit = await this.prismaService.deposit.findUnique({
      where: { id },
    });
    this.checkAccessToDeposit(deposit, reqUser);
    return this.prismaService.deposit.delete({ where: { id } });
  }

  private checkAccessToDeposit(deposit: any, user: any): void {
    if (!deposit) throw new NotFoundException('Deposit not found');
    if (deposit.userId !== user.id && user.role != Role.ADMIN) {
      throw new ForbiddenException('You dont have access');
    }
  }
}
