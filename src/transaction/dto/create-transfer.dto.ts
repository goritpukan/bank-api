import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

export class CreateTransferDto {
  @ApiProperty({
    description: 'Account number from which the transfer is made',
    example: '1234111111111111',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^1234\d{12}$/, {
    message:
      'accountNumber must start with "1234" and contain exactly 16 digits',
  })
  sourceAccountNumber: string;

  @ApiProperty({
    description: 'Account number to which the transfer is made',
    example: '1234111111111111',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^1234\d{12}$/, {
    message:
      'accountNumber must start with "1234" and contain exactly 16 digits',
  })
  destinationAccountNumber: string;

  @ApiProperty({ description: 'Transfer amount', example: 100.1 })
  @IsNumber()
  transferAmount: number;
}
