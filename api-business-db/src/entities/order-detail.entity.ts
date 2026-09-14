import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';

@Entity('orderdetails')
export class OrderDetail {
  @PrimaryColumn({ type: 'int', name: 'orderNumber' })
  orderNumber: number;

  @PrimaryColumn({ type: 'varchar', length: 15, name: 'productCode' })
  productCode: string;

  @Column({ type: 'int', name: 'quantityOrdered' })
  quantityOrdered: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'priceEach' })
  priceEach: number;

  @Column({ type: 'smallint', name: 'orderLineNumber' })
  orderLineNumber: number;

  @ManyToOne(() => Order, (order) => order.orderDetails, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'orderNumber' })
  order?: Order;

  @ManyToOne(() => Product, (product) => product.orderDetails, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'productCode' })
  product?: Product;
}
