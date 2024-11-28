import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateDepositDto {
  @ApiProperty({ name: 'amount', type: Number, example: 500 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
