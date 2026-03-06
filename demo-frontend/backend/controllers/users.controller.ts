import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    const items = await this.usersService.findAll();
    return { data: items, success: true };
  }

  @Post()
  async create(@Body() data: any) {
    const item = await this.usersService.create(data);
    return { data: item, success: true };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.usersService.findOne(id as string);
    if (!item) {
      return { error: 'Users not found', success: false };
    }
    return { data: item, success:  true };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    const item = await this.usersService.update(id as string, data);
    return { data: item, success: true };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id as string);
    return { message: 'Users deleted', success: true };
  }
}
