import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { plainToClass } from 'class-transformer';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const data = plainToClass(CreateUserDto, createUserDto);
    const saltOrRounds = 10;
    data.password = await bcrypt.hash(data.password, saltOrRounds);
    return this.prisma.user.create({ data });
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    if (!users.length) throw new NotFoundException('Users not found');
    return users;
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user)
      throw new UnauthorizedException('Email or password is incorrect');
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const data = plainToClass(UpdateUserDto, updateUserDto);
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  block(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: {isBlocked: true },
    });
  }
  unblock(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: {isBlocked: false },
    });
  }
}
