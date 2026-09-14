import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Office } from '../../entities/office.entity';

@Injectable()
export class OfficesService {
  constructor(
    @InjectRepository(Office)
    private readonly officeRepository: Repository<Office>,
  ) {}

  findAll(): Promise<Office[]> {
    return this.officeRepository.find();
  }

  async findOne(id: string): Promise<Office> {
    const office = await this.officeRepository.findOne({
      where: { officeCode: id },
      relations: {
        employees: true,
      },
    });
    if (!office) {
      throw new NotFoundException(`Office #${id} not found`);
    }
    return office;
  }

  create(data: Partial<Office>): Promise<Office> {
    const office = this.officeRepository.create(data);
    return this.officeRepository.save(office);
  }

  async update(id: string, data: Partial<Office>): Promise<Office> {
    await this.findOne(id);
    await this.officeRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const office = await this.findOne(id);
    await this.officeRepository.remove(office);
    return { message: `Office #${id} deleted successfully` };
  }
}
