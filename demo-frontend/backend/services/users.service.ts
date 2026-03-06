import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Users } from '../schemas/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name) private usersModel: Model<Users>
  ) {}

  async findAll() {
    return this.usersModel.find().exec();
  }

  async findOne(id: string) {
    return this.usersModel.findById(id).exec();
  }

  async create(data: Partial<Users>) {
    const item = new this.usersModel(data);
    return item.save();
  }

  async update(id: string, data: Partial<Users>) {
    return this.usersModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async remove(id: string) {
    return this.usersModel.findByIdAndDelete(id).exec();
  }
}
