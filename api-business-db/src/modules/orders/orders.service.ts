import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: {
        customer: true,
        orderDetails: {
          product: true,
        },
      },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderNumber: id },
      relations: {
        customer: true,
        orderDetails: {
          product: true,
        },
      },
    });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return order;
  }

  create(data: Partial<Order>): Promise<Order> {
    const order = this.orderRepository.create(data);
    return this.orderRepository.save(order);
  }

  async update(id: number, data: Partial<Order>): Promise<Order> {
    await this.findOne(id);
    await this.orderRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
    return { message: `Order #${id} deleted successfully` };
  }
}
