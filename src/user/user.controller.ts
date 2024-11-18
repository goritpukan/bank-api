import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get all users (Only for admin)' })
  @UseGuards(AuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @ApiOperation({ summary: 'Get user by id (Only for admin)' })
  @UseGuards(AuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update user by id (Only for admin)' })
  @UseGuards(AuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete user (Only for admin)' })
  @UseGuards(AuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @ApiOperation({ summary: 'Block user (Only for admin)' })
  @UseGuards(AuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @Patch('block/:id')
  block(@Param('id') id: string) {
    return this.userService.block(+id);
  }

  @ApiOperation({ summary: 'Unblock user (Only for admin)' })
  @UseGuards(AuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @Patch('unblock/:id')
  unblock(@Param('id') id: string) {
    return this.userService.unblock(+id);
  }
}
