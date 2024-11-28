import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class CreateBankAccountDto {
  @ApiProperty({ enum: Currency })
  @IsEnum(Currency)
  @IsOptional()
  currency: string;
}
