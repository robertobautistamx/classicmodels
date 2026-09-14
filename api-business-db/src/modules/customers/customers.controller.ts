import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer } from '../../entities/customer.entity';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(): Promise<Customer[]> {
    return this.customersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Customer> {
    return this.customersService.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<Customer>): Promise<Customer> {
    return this.customersService.create(data);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<Customer>,
  ): Promise<Customer> {
    return this.customersService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.customersService.remove(id);
  }
}
