import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DepositService } from './deposit.service';
import { UpdateDepositDto } from './dto/update-deposit.dto';
import { ApiBody, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { AdminGuard } from '../guards/admin.guard';
import { UpdateInterestDto } from './dto/update-interest-dto';

@Controller('deposit')
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Creates a deposit' })
  @ApiBody({ type: CreateDepositDto })
  @ApiCookieAuth('access_token')
  @Post()
  create(@Request() req: any, @Body() createDepositDto: CreateDepositDto) {
    return this.depositService.create(req.user, createDepositDto);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'List of all user deposits'})
  @ApiCookieAuth('access_token')
  @Get("/all/:id")
  findAll(@Request() req: any, @Param('id') id: string) {
    return this.depositService.findAll(req.user, +id);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get deposit amount after interest is accrued.' })
  @ApiCookieAuth('access_token')
  @Get(":id")
  getAmount(@Request() req: any, @Param('id') id: string) {
    return this.depositService.getAmount(req.user, +id)
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Updates deposit balance' })
  @ApiBody({ type: UpdateDepositDto })
  @ApiCookieAuth('access_token')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDepositDto: UpdateDepositDto,
    @Request() req: any,
  ) {
    return this.depositService.update(+id, req.user, updateDepositDto);
  }
  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({summary: "Change deposit interest rate(only for admin)"})
  @ApiCookieAuth('access_token')
  @Patch('/interest/:id')
  updateInterestRate(@Param('id') id: string, @Body() updateInterestDpo: UpdateInterestDto) {
    return this.depositService.updateInterestRate(+id, updateInterestDpo);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete deposit' })
  @ApiCookieAuth('access_token')
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.depositService.remove(+id, req.user);
  }
}
