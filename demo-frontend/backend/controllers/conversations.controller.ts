import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ConversationsService } from '../services/conversations.service';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  async findAll() {
    const items = await this.conversationsService.findAll();
    return { data: items, success: true };
  }

  @Post()
  async create(@Body() data: any) {
    const item = await this.conversationsService.create(data);
    return { data: item, success: true };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.conversationsService.findOne(id as string);
    if (!item) {
      return { error: 'Conversations not found', success: false };
    }
    return { data: item, success:  true };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    const item = await this.conversationsService.update(id as string, data);
    return { data: item, success: true };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.conversationsService.remove(id as string);
    return { message: 'Conversations deleted', success: true };
  }
}
