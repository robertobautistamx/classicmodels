import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from './customer.entity';

@Entity('payments')
export class Payment {
  @PrimaryColumn({ type: 'int', name: 'customerNumber' })
  customerNumber: number;

  @PrimaryColumn({ type: 'varchar', length: 50, name: 'checkNumber' })
  checkNumber: string;

  @Column({ type: 'date', name: 'paymentDate' })
  paymentDate: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'amount' })
  amount: number;

  @ManyToOne(() => Customer, (customer) => customer.payments, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'customerNumber' })
  customer?: Customer;
}
