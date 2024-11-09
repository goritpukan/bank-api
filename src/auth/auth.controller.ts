import { Body, Controller, Delete, Post, Res } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {type: 'string', example: 'email@gmail.com'},
        password: {type: 'string', example: 'password'},
      },
      required:['email', 'password'],
    },
  })
  @Post('signin')
  async signin(@Body() body, @Res() res: Response) {
    return this.authService.signin(body.email, body.password, res)
  }

  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    return this.authService.signup(createUserDto, res);
  }

  @Delete('loguot')
  logout() {
    this.authService.logout();
  }
}
