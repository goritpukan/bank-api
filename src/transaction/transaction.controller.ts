import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '../guards/auth.guard';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { CreateTransferDto } from './dto/create-transfer.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Make a transfer'})
  @ApiCookieAuth('access_token')
  @Post('/transfer')
  createTransfer(@Request() req: any, @Body() createTransferDto: CreateTransferDto) {
    return this.transactionService.createTransfer(createTransferDto, req.user);
  }
}
