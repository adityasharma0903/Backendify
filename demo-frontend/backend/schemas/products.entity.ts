import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Products extends Document {
  @Prop({ required: false })
  name: string;

  @Prop({ required: false })
  price: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  category: string;

  @Prop({ required: false })
  stock: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ProductsSchema = SchemaFactory.createForClass(Products);