import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Payment } from '../../entities/payment.entity';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  findAll(): Promise<Payment[]> {
    return this.paymentsService.findAll();
  }

  @Get(':customerNumber/:checkNumber')
  findOne(
    @Param('customerNumber', ParseIntPipe) customerNumber: number,
    @Param('checkNumber') checkNumber: string,
  ): Promise<Payment> {
    return this.paymentsService.findOne(customerNumber, checkNumber);
  }

  @Post()
  create(@Body() data: Partial<Payment>): Promise<Payment> {
    return this.paymentsService.create(data);
  }

  @Put(':customerNumber/:checkNumber')
  update(
    @Param('customerNumber', ParseIntPipe) customerNumber: number,
    @Param('checkNumber') checkNumber: string,
    @Body() data: Partial<Payment>,
  ): Promise<Payment> {
    return this.paymentsService.update(customerNumber, checkNumber, data);
  }

  @Delete(':customerNumber/:checkNumber')
  remove(
    @Param('customerNumber', ParseIntPipe) customerNumber: number,
    @Param('checkNumber') checkNumber: string,
  ): Promise<{ message: string }> {
    return this.paymentsService.remove(customerNumber, checkNumber);
  }
}
