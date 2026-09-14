import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ProductLinesService } from './product-lines.service';
import { ProductLine } from '../../entities/product-line.entity';

@Controller('product-lines')
export class ProductLinesController {
  constructor(private readonly productLinesService: ProductLinesService) {}

  @Get()
  findAll(): Promise<ProductLine[]> {
    return this.productLinesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ProductLine> {
    return this.productLinesService.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<ProductLine>): Promise<ProductLine> {
    return this.productLinesService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<ProductLine>): Promise<ProductLine> {
    return this.productLinesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.productLinesService.remove(id);
  }
}
