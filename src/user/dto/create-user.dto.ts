import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsEmail } from "class-validator";
export class CreateUserDto {
  @ApiProperty({example: 'user@example.com'})
  @IsEmail()
  email: string;

  @ApiProperty({example: 'John'})
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({example: 'Doe'})
  @IsNotEmpty()
  lastName: string;

}
