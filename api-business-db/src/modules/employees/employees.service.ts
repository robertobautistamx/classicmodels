import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../entities/employee.entity';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  findAll(): Promise<Employee[]> {
    return this.employeeRepository.find({
      relations: {
        office: true,
        manager: true,
      },
    });
  }

  async findOne(id: number): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { employeeNumber: id },
      relations: {
        office: true,
        manager: true,
        subordinates: true,
        customers: true,
      },
    });
    if (!employee) {
      throw new NotFoundException(`Employee #${id} not found`);
    }
    return employee;
  }

  create(data: Partial<Employee>): Promise<Employee> {
    const employee = this.employeeRepository.create(data);
    return this.employeeRepository.save(employee);
  }

  async update(id: number, data: Partial<Employee>): Promise<Employee> {
    await this.findOne(id);
    await this.employeeRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const employee = await this.findOne(id);
    await this.employeeRepository.remove(employee);
    return { message: `Employee #${id} deleted successfully` };
  }
}
