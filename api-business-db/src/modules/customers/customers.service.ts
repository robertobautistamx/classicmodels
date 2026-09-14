import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  findAll(): Promise<Customer[]> {
    return this.customerRepository.find({
      relations: {
        salesRepEmployee: true,
      },
    });
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { customerNumber: id },
      relations: {
        salesRepEmployee: true,
        orders: true,
        payments: true,
      },
    });
    if (!customer) {
      throw new NotFoundException(`Customer #${id} not found`);
    }
    return customer;
  }

  create(data: Partial<Customer>): Promise<Customer> {
    const customer = this.customerRepository.create(data);
    return this.customerRepository.save(customer);
  }

  async update(id: number, data: Partial<Customer>): Promise<Customer> {
    await this.findOne(id);
    await this.customerRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const customer = await this.findOne(id);
    await this.customerRepository.remove(customer);
    return { message: `Customer #${id} deleted successfully` };
  }
}
