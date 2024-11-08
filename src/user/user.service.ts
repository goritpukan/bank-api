import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { plainToClass } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    const data = plainToClass(CreateUserDto, createUserDto)
    return this.prisma.user.create({data});
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    if(!users.length) throw new NotFoundException('Users not found');
    return users;
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({where: {id}});
    if(!user) throw new NotFoundException('User  not found');
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const data = plainToClass(UpdateUserDto, updateUserDto)
    return this.prisma.user.update({
      where: {id},
      data
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({where: {id}});
  }
}
