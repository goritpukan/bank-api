import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { TransactionType } from '@prisma/client';
enum AllowedTransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}
export class CreateTransactionDto {
  @ApiProperty({description: "Transfer amount", example: 500})
  @IsNotEmpty()
  @IsNumber()
  transferAmount: number;

  @ApiProperty({description: "transfer type", enum: AllowedTransactionType})
  @IsNotEmpty()
  @IsEnum(AllowedTransactionType)
  transactionType: TransactionType;
}
