import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { OfficesService } from './offices.service';
import { Office } from '../../entities/office.entity';

@Controller('offices')
export class OfficesController {
  constructor(private readonly officesService: OfficesService) {}

  @Get()
  findAll(): Promise<Office[]> {
    return this.officesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Office> {
    return this.officesService.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<Office>): Promise<Office> {
    return this.officesService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Office>): Promise<Office> {
    return this.officesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.officesService.remove(id);
  }
}
