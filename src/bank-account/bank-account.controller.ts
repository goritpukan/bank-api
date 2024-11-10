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
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';

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
  @ApiOperation({ summary: 'Get all users accounts' })
  @ApiCookieAuth('access_token')
  @UseGuards(AuthGuard)
  @Get('all/:userId')
  findAll(@Request() req: any, @Param('userId') userId: string) {
    return this.bankAccountService.findAll(+userId, req.user);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get bank account by id' })
  @ApiCookieAuth('access_token')
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.bankAccountService.findOne(+id, req.user);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete bank account by id' })
  @ApiCookieAuth('access_token')
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.bankAccountService.remove(+id, req.user);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Block bank account by id' })
  @ApiCookieAuth('access_token')
  @Patch('block/:id')
  block(@Param('id') id: string, @Request() req: any) {
    return this.bankAccountService.block(+id, req.user);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Unblock bank account by id' })
  @ApiCookieAuth('access_token')
  @Patch('unblock/:id')
  unblock(@Param('id') id: string, @Request() req: any) {
    return this.bankAccountService.unblock(+id, req.user);
  }
}
