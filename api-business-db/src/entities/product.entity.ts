import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ProductLine } from './product-line.entity';
import { OrderDetail } from './order-detail.entity';

@Entity('products')
export class Product {
  @PrimaryColumn({ type: 'varchar', length: 15, name: 'productCode' })
  productCode: string;

  @Column({ type: 'varchar', length: 70, name: 'productName' })
  productName: string;

  @Column({ type: 'varchar', length: 50, name: 'productLine' })
  productLine: string;

  @Column({ type: 'varchar', length: 10, name: 'productScale' })
  productScale: string;

  @Column({ type: 'varchar', length: 50, name: 'productVendor' })
  productVendor: string;

  @Column({ type: 'text', name: 'productDescription' })
  productDescription: string;

  @Column({ type: 'smallint', name: 'quantityInStock' })
  quantityInStock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'buyPrice' })
  buyPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'MSRP' })
  MSRP: number;

  @ManyToOne(() => ProductLine, (pl) => pl.products, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'productLine' })
  productLineEntity?: ProductLine;

  @OneToMany(() => OrderDetail, (od) => od.product)
  orderDetails?: OrderDetail[];
}
