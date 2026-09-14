import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  findAll(): Promise<Payment[]> {
    return this.paymentRepository.find({
      relations: {
        customer: true,
      },
    });
  }

  async findOne(customerNumber: number, checkNumber: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { customerNumber, checkNumber },
      relations: {
        customer: true,
      },
    });
    if (!payment) {
      throw new NotFoundException(`Payment for customer #${customerNumber} and check #${checkNumber} not found`);
    }
    return payment;
  }

  create(data: Partial<Payment>): Promise<Payment> {
    const payment = this.paymentRepository.create(data);
    return this.paymentRepository.save(payment);
  }

  async update(customerNumber: number, checkNumber: string, data: Partial<Payment>): Promise<Payment> {
    await this.findOne(customerNumber, checkNumber);
    await this.paymentRepository.update({ customerNumber, checkNumber }, data);
    return this.findOne(customerNumber, checkNumber);
  }

  async remove(customerNumber: number, checkNumber: string): Promise<{ message: string }> {
    const payment = await this.findOne(customerNumber, checkNumber);
    await this.paymentRepository.remove(payment);
    return { message: `Payment removed successfully` };
  }
}
