import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Employee } from '../../entities/employee.entity';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  findAll(): Promise<Employee[]> {
    return this.employeesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Employee> {
    return this.employeesService.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<Employee>): Promise<Employee> {
    return this.employeesService.create(data);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<Employee>,
  ): Promise<Employee> {
    return this.employeesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.employeesService.remove(id);
  }
}
