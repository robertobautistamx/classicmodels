import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductLine } from '../../entities/product-line.entity';
import { ProductLinesService } from './product-lines.service';
import { ProductLinesController } from './product-lines.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductLine])],
  controllers: [ProductLinesController],
  providers: [ProductLinesService],
  exports: [ProductLinesService],
})
export class ProductLinesModule {}
