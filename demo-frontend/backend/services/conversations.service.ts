import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversations } from '../schemas/conversations.entity';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversations.name) private conversationsModel: Model<Conversations>
  ) {}

  async findAll() {
    return this.conversationsModel.find().exec();
  }

  async findOne(id: string) {
    return this.conversationsModel.findById(id).exec();
  }

  async create(data: Partial<Conversations>) {
    const item = new this.conversationsModel(data);
    return item.save();
  }

  async update(id: string, data: Partial<Conversations>) {
    return this.conversationsModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async remove(id: string) {
    return this.conversationsModel.findByIdAndDelete(id).exec();
  }
}
