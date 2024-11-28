import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, MinLength, MaxLength } from 'class-validator';
import { Exclude } from 'class-transformer';
import { Role } from '@prisma/client';
export class CreateUserDto {
  @Exclude()
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  lastName: string;

  @ApiProperty({ example: 'password' })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(30)
  password: string;

  @Exclude()
  role?: Role;
}
