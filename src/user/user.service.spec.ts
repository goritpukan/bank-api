import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 1,
            email: 'user1@example.com',
            firstName: 'John',
            lastName: 'Doe',
            isBlocked: false,
          },
          {
            id: 2,
            email: 'user2@example.com',
            firstName: 'Jane',
            lastName: 'Smith',
            isBlocked: false,
          },
        ]),
        findUnique: jest.fn().mockResolvedValue({
          id: 1,
          email: 'user1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          isBlocked: false,
        }),
        create: jest.fn().mockResolvedValue({
          id: 1,
          email: 'user1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'hashedPassword',
          isBlocked: false,
        }),
        update: jest.fn().mockResolvedValue({
          id: 1,
          email: 'user1@example.com',
          firstName: 'John Updated',
          lastName: 'Doe Updated',
          password: 'hashedPassword',
          isBlocked: false,
        }),
        delete: jest.fn().mockResolvedValue({
          id: 1,
          email: 'user1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          isBlocked: false,
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call prisma.user.findMany and return all users', async () => {
    const result = await service.findAll();
    expect(prismaService.user.findMany).toHaveBeenCalled();
    expect(result).toEqual([
      {
        id: 1,
        email: 'user1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isBlocked: false,
      },
      {
        id: 2,
        email: 'user2@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        isBlocked: false,
      },
    ]);
  });
  it('should call prisma.user.findUnique and return one unique user by id {1}', async () => {
    const result = await service.findOne(1);
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(result).toEqual({
      id: 1,
      email: 'user1@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isBlocked: false,
    });
  });
  it('should throw not found error when user not found by id', async () => {
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
    await expect(service.findOne(1)).rejects.toThrowError(
      new NotFoundException('User not found'),
    );
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should return user when email is found', async () => {
    const result = await service.findOneByEmail('user1@examle.com');
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'user1@examle.com' },
    });
    expect(result).toEqual({
      id: 1,
      email: 'user1@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isBlocked: false,
    });
  });
  it('should throw not found error when user not found by email', async () => {
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
    await expect(
      service.findOneByEmail('nonexistent@example.com'),
    ).rejects.toThrowError(
      new NotFoundException('Email or password is incorrect'),
    );
  });
  it('should create a user and hash the password', async () => {
    const createUserDto: CreateUserDto = {
      id: 1,
      email: 'user1@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'plainPassword',
    };
    const hashedPassword = 'hashedPassword';
    jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);

    const result = await service.create(createUserDto);

    expect(prismaService.user.create).toHaveBeenCalledWith({
      data: {
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        password: hashedPassword,
      },
    });
    expect(result).toEqual({
      id: 1,
      email: 'user1@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'hashedPassword',
      isBlocked: false,
    });

    expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
  });
  it('should throw ConflictException if email is already in use', async () => {
    const createUserDto: CreateUserDto = {
      id: 1,
      email: 'user1@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'plainPassword',
    };

    jest.spyOn(prismaService.user, 'create').mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('This email is already in use', {
        code: 'P2002',
        meta: {
          target: ['email'],
        },
        clientVersion: '5.22.0',
      }),
    );

    await expect(service.create(createUserDto)).rejects.toThrowError(
      new ConflictException('This email is already in use'),
    );

    expect(prismaService.user.create).toHaveBeenCalledWith({
      data: {
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        password: expect.any(String),
      },
    });
  });
  it('should update a user successfully', async () => {
    const updateUserDto: UpdateUserDto = {
      firstName: 'John Updated',
      lastName: 'Doe Updated',
    };

    const result = await service.update(1, updateUserDto);

    expect(prismaService.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
      },
    });
    expect(result).toEqual({
      id: 1,
      email: 'user1@example.com',
      firstName: 'John Updated',
      lastName: 'Doe Updated',
      password: 'hashedPassword',
      isBlocked: false,
    });
  });
  it('should throw ConflictException if email is already in use during update', async () => {
    const updateUserDto: UpdateUserDto = {
      firstName: 'John Updated',
      lastName: 'Doe Updated',
    };

    jest.spyOn(prismaService.user, 'update').mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError(
        'This email is already in use',
        {
          code: 'P2002',
          meta: {
            target: ['email'],
          },
          clientVersion: '4.5.0',
        },
      ),
    );

    await expect(service.update(1, updateUserDto)).rejects.toThrowError(
      new ConflictException('This email is already in use'),
    );

    expect(prismaService.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
      },
    });
  });

  it('should remove a user', async () => {
    const id = 1;

    const result = await service.remove(id);

    expect(prismaService.user.delete).toHaveBeenCalledWith({
      where: { id },
    });
    expect(result).toEqual({
      id: 1,
      email: 'user1@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isBlocked: false,
    });
  });

  it('should block a user', async () => {
    const id = 1;
    jest.spyOn(prismaService.user, 'update').mockResolvedValueOnce({
      id: 1,
      email: 'user1@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'hashedPassword',
      role: 'USER',
      isBlocked: true,
    });
    const result = await service.block(id);
    expect(prismaService.user.update).toHaveBeenCalledWith({
      where: { id },
      data: { isBlocked: true },
    });
    expect(result).toEqual({
      id: 1,
      email: 'user1@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'hashedPassword',
      role: 'USER',
      isBlocked: true,
    });
  });

  it('should unblock a user', async () => {
    const id = 1;
    jest.spyOn(prismaService.user, 'update').mockResolvedValueOnce({
      id: 1,
      email: 'user1@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'hashedPassword',
      role: 'USER',
      isBlocked: false,
    });
    const result = await service.unblock(id);
    expect(prismaService.user.update).toHaveBeenCalledWith({
      where: { id },
      data: { isBlocked: false },
    });
    expect(result).toEqual({
      id: 1,
      email: 'user1@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'hashedPassword',
      role: 'USER',
      isBlocked: false,
    });
  });
});
