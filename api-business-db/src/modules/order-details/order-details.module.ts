import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderDetail } from '../../entities/order-detail.entity';
import { OrderDetailsService } from './order-details.service';
import { OrderDetailsController } from './order-details.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrderDetail])],
  controllers: [OrderDetailsController],
  providers: [OrderDetailsService],
  exports: [OrderDetailsService],
})
export class OrderDetailsModule {}
