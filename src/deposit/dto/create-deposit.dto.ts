import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateDepositDto {
  @ApiProperty({ name: 'currency', enum: Currency })
  @IsNotEmpty()
  @IsEnum(Currency)
  currency: Currency;
}
