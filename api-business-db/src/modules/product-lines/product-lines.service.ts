import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductLine } from '../../entities/product-line.entity';

@Injectable()
export class ProductLinesService {
  constructor(
    @InjectRepository(ProductLine)
    private readonly productLineRepository: Repository<ProductLine>,
  ) {}

  findAll(): Promise<ProductLine[]> {
    return this.productLineRepository.find();
  }

  async findOne(id: string): Promise<ProductLine> {
    const productLine = await this.productLineRepository.findOne({
      where: { productLine: id },
      relations: {
        products: true,
      },
    });
    if (!productLine) {
      throw new NotFoundException(`ProductLine '${id}' not found`);
    }
    return productLine;
  }

  create(data: Partial<ProductLine>): Promise<ProductLine> {
    const productLine = this.productLineRepository.create(data);
    return this.productLineRepository.save(productLine);
  }

  async update(id: string, data: Partial<ProductLine>): Promise<ProductLine> {
    await this.findOne(id);
    await this.productLineRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const productLine = await this.findOne(id);
    await this.productLineRepository.remove(productLine);
    return { message: `ProductLine '${id}' deleted successfully` };
  }
}
