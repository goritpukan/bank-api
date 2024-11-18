import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '../guards/auth.guard';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Make a transfer' })
  @ApiCookieAuth('access_token')
  @Post('/transfer')
  createTransfer(@Request() req: any, @Body() createTransferDto: CreateTransferDto) {
    return this.transactionService.createTransfer(createTransferDto, req.user);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a deposit to user bank account' })
  @ApiCookieAuth('access_token')
  @ApiParam({name: "accountId", description: "Account ID", example: "1234111111111111"})
  @Post(':accountId')
  createDeposit(@Param('accountId') accountNumber: string, @Request() req: any, @Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.createTransaction(accountNumber, req.user, createTransactionDto);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Show all user transactions by user id' })
  @ApiCookieAuth('access_token')
  @Get('/:id')
  getTransactions(@Param('id') id: string, @Request() req: any) {
    return this.transactionService.getTransactions(+id, req.user);
  }
}
