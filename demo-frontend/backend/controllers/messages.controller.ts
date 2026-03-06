import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { MessagesService } from '../services/messages.service';

@Controller('conversations/:conversationId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  async findAllByRelation(@Param('conversationId') conversationId: string) {
    const items = await this.messagesService.findByRelation(conversationId as string);
    return { data: items, success: true };
  }

  @Post()
  async createForRelation(@Param('conversationId') conversationId: string, @Body() data: any) {
    const item = await this.messagesService.createForRelation(conversationId as string, data);
    return { data: item, success: true };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.messagesService.findOne(id as string);
    if (!item) {
      return { error: 'Messages not found', success: false };
    }
    return { data: item, success:  true };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    const item = await this.messagesService.update(id as string, data);
    return { data: item, success: true };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.messagesService.remove(id as string);
    return { message: 'Messages deleted', success: true };
  }
}
