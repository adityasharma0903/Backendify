import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ProductsService } from '../services/products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll() {
    const items = await this.productsService.findAll();
    return { data: items, success: true };
  }

  @Post()
  async create(@Body() data: any) {
    const item = await this.productsService.create(data);
    return { data: item, success: true };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.productsService.findOne(id as string);
    if (!item) {
      return { error: 'Products not found', success: false };
    }
    return { data: item, success:  true };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    const item = await this.productsService.update(id as string, data);
    return { data: item, success: true };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id as string);
    return { message: 'Products deleted', success: true };
  }
}
