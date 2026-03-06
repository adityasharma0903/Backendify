import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Messages } from '../schemas/messages.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Messages.name) private messagesModel: Model<Messages>
  ) {}

  async findAll() {
    return this.messagesModel.find().exec();
  }

  async findOne(id: string) {
    return this.messagesModel.findById(id).exec();
  }

  async create(data: Partial<Messages>) {
    const item = new this.messagesModel(data);
    return item.save();
  }

  async update(id: string, data: Partial<Messages>) {
    return this.messagesModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async remove(id: string) {
    return this.messagesModel.findByIdAndDelete(id).exec();
  }

  async findByRelation(conversationId: string) {
    return this.messagesModel.find({ conversationId: conversationId }).exec();
  }

  async createForRelation(conversationId: string, data: Partial<Messages>) {
    const item = new this.messagesModel({ ...data, conversationId: conversationId });
    return item.save();
  }
}
