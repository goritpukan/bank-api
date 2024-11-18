import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateInterestDto {
  @ApiProperty({})
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  interestRate: number;
}