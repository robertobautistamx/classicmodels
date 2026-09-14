import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Customer } from './customer.entity';
import { OrderDetail } from './order-detail.entity';

@Entity('orders')
export class Order {
  @PrimaryColumn({ type: 'int', name: 'orderNumber' })
  orderNumber: number;

  @Column({ type: 'date', name: 'orderDate' })
  orderDate: string;

  @Column({ type: 'date', name: 'requiredDate' })
  requiredDate: string;

  @Column({ type: 'date', name: 'shippedDate', nullable: true })
  shippedDate?: string;

  @Column({ type: 'varchar', length: 15, name: 'status' })
  status: string;

  @Column({ type: 'text', name: 'comments', nullable: true })
  comments?: string;

  @Column({ type: 'int', name: 'customerNumber' })
  customerNumber: number;

  @ManyToOne(() => Customer, (customer) => customer.orders, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'customerNumber' })
  customer?: Customer;

  @OneToMany(() => OrderDetail, (od) => od.order)
  orderDetails?: OrderDetail[];
}
