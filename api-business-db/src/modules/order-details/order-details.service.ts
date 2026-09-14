import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderDetail } from '../../entities/order-detail.entity';

@Injectable()
export class OrderDetailsService {
  constructor(
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
  ) {}

  findAll(): Promise<OrderDetail[]> {
    return this.orderDetailRepository.find({
      relations: {
        order: true,
        product: true,
      },
    });
  }

  async findOne(orderNumber: number, productCode: string): Promise<OrderDetail> {
    const detail = await this.orderDetailRepository.findOne({
      where: { orderNumber, productCode },
      relations: {
        order: true,
        product: true,
      },
    });
    if (!detail) {
      throw new NotFoundException(`OrderDetail for order #${orderNumber} and product #${productCode} not found`);
    }
    return detail;
  }

  create(data: Partial<OrderDetail>): Promise<OrderDetail> {
    const detail = this.orderDetailRepository.create(data);
    return this.orderDetailRepository.save(detail);
  }

  async update(orderNumber: number, productCode: string, data: Partial<OrderDetail>): Promise<OrderDetail> {
    await this.findOne(orderNumber, productCode);
    await this.orderDetailRepository.update({ orderNumber, productCode }, data);
    return this.findOne(orderNumber, productCode);
  }

  async remove(orderNumber: number, productCode: string): Promise<{ message: string }> {
    const detail = await this.findOne(orderNumber, productCode);
    await this.orderDetailRepository.remove(detail);
    return { message: `OrderDetail removed successfully` };
  }
}
