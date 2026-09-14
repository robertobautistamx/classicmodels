import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: {
        productLineEntity: true,
      },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { productCode: id },
      relations: {
        productLineEntity: true,
        orderDetails: true,
      },
    });
    if (!product) {
      throw new NotFoundException(`Product '${id}' not found`);
    }
    return product;
  }

  create(data: Partial<Product>): Promise<Product> {
    const product = this.productRepository.create(data);
    return this.productRepository.save(product);
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    await this.findOne(id);
    await this.productRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return { message: `Product '${id}' deleted successfully` };
  }
}
