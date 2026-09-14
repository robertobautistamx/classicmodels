import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { OrderDetailsService } from './order-details.service';
import { OrderDetail } from '../../entities/order-detail.entity';

@Controller('order-details')
export class OrderDetailsController {
  constructor(private readonly orderDetailsService: OrderDetailsService) {}

  @Get()
  findAll(): Promise<OrderDetail[]> {
    return this.orderDetailsService.findAll();
  }

  @Get(':orderNumber/:productCode')
  findOne(
    @Param('orderNumber', ParseIntPipe) orderNumber: number,
    @Param('productCode') productCode: string,
  ): Promise<OrderDetail> {
    return this.orderDetailsService.findOne(orderNumber, productCode);
  }

  @Post()
  create(@Body() data: Partial<OrderDetail>): Promise<OrderDetail> {
    return this.orderDetailsService.create(data);
  }

  @Put(':orderNumber/:productCode')
  update(
    @Param('orderNumber', ParseIntPipe) orderNumber: number,
    @Param('productCode') productCode: string,
    @Body() data: Partial<OrderDetail>,
  ): Promise<OrderDetail> {
    return this.orderDetailsService.update(orderNumber, productCode, data);
  }

  @Delete(':orderNumber/:productCode')
  remove(
    @Param('orderNumber', ParseIntPipe) orderNumber: number,
    @Param('productCode') productCode: string,
  ): Promise<{ message: string }> {
    return this.orderDetailsService.remove(orderNumber, productCode);
  }
}
