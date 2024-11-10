import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async signin(email: string, pass: string, res: Response) {
    const user = await this.userService.findOneByEmail(email);
    if (!(await bcrypt.compare(pass, user.password)))
      throw new UnauthorizedException('Email or password is incorrect');
    const { password, ...result } = user;
    await this.createJwtCookie(res, user.id, user.role);
    res.status(200).json(result);
  }

  async signup(createUserDto: CreateUserDto, res: Response) {
    const user = await this.userService.create(createUserDto);
    if (!user) {
      throw new InternalServerErrorException('An unexpected error occurred');
    }
    const { password, ...result } = user;
    await this.createJwtCookie(res, user.id, user.role);
    res.status(200).json(result);
  }

  logout(res: Response) {
    res.clearCookie('access_token');
    res.status(200).json("logged out successfully");
  }

  private async createJwtCookie(res: Response, id: number, role: string) {
    const payload = { id, role };
    const token = await this.jwtService.signAsync(payload);
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: 'strict',
    });
  }
}
