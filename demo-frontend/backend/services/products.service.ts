import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Products } from '../schemas/products.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Products.name) private productsModel: Model<Products>
  ) {}

  async findAll() {
    return this.productsModel.find().exec();
  }

  async findOne(id: string) {
    return this.productsModel.findById(id).exec();
  }

  async create(data: Partial<Products>) {
    const item = new this.productsModel(data);
    return item.save();
  }

  async update(id: string, data: Partial<Products>) {
    return this.productsModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async remove(id: string) {
    return this.productsModel.findByIdAndDelete(id).exec();
  }
}
