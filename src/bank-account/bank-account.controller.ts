import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { BankAccountService } from './bank-account.service';
import { AuthGuard } from '../guards/auth.guard';
import { ApiCookieAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { Currency } from '@prisma/client';
import { swaggerBankAccount } from '../config/swagger-params';

@Controller('account')
export class BankAccountController {
  constructor(private readonly bankAccountService: BankAccountService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create new bank account' })
  @ApiCookieAuth('access_token')
  @Post()
  create(
    @Request() req: any,
    @Body() createBankAccountDto: CreateBankAccountDto,
  ) {
    return this.bankAccountService.create(+req.user.id, createBankAccountDto);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all user accounts' })
  @ApiCookieAuth('access_token')
  @UseGuards(AuthGuard)
  @Get('all/:userId')
  findAll(@Request() req: any, @Param('userId') userId: string) {
    return this.bankAccountService.findAll(+userId, req.user);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get bank account by account number' })
  @ApiParam(swaggerBankAccount)
  @ApiCookieAuth('access_token')
  @Get(':accountNumber')
  findOne(@Param('accountNumber') accountNumber: string, @Request() req: any) {
    return this.bankAccountService.findOne(accountNumber, req.user);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get user balance in selected currency' })
  @ApiParam({
    name: 'currency',
    enum: Currency,
    description: 'Currency to filter bank accounts',
  })
  @ApiParam(swaggerBankAccount)
  @ApiCookieAuth('access_token')
  @Get('balance/:accountNumber/:currency')
  getBalance(
    @Param('accountNumber') accountNumber: string,
    @Param('currency') currency: Currency,
    @Request() req: any,
  ) {
    return this.bankAccountService.getBalance(
      accountNumber,
      currency,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete bank account by account number' })
  @ApiParam(swaggerBankAccount)
  @ApiCookieAuth('access_token')
  @Delete(':accountNumber')
  remove(@Param('accountNumber') accountNumber: string, @Request() req: any) {
    return this.bankAccountService.remove(accountNumber, req.user);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Block bank account by account number' })
  @ApiParam(swaggerBankAccount)
  @ApiCookieAuth('access_token')
  @Patch('block/:accountNumber')
  block(@Param('accountNumber') accountNumber: string, @Request() req: any) {
    return this.bankAccountService.block(accountNumber, req.user);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Unblock bank account by account number' })
  @ApiParam(swaggerBankAccount)
  @ApiCookieAuth('access_token')
  @Patch('unblock/:accountNumber')
  unblock(@Param('accountNumber') accountNumber: string, @Request() req: any) {
    return this.bankAccountService.unblock(accountNumber, req.user);
  }
}
