import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from '../../entities/product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<Product>): Promise<Product> {
    return this.productsService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Product>): Promise<Product> {
    return this.productsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.productsService.remove(id);
  }
}
