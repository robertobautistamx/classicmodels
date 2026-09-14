import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Office } from '../../entities/office.entity';
import { OfficesService } from './offices.service';
import { OfficesController } from './offices.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Office])],
  controllers: [OfficesController],
  providers: [OfficesService],
  exports: [OfficesService],
})
export class OfficesModule {}
