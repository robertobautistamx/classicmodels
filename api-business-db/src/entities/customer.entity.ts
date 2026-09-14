import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Employee } from './employee.entity';
import { Order } from './order.entity';
import { Payment } from './payment.entity';

@Entity('customers')
export class Customer {
  @PrimaryColumn({ type: 'int', name: 'customerNumber' })
  customerNumber: number;

  @Column({ type: 'varchar', length: 50, name: 'customerName' })
  customerName: string;

  @Column({ type: 'varchar', length: 50, name: 'contactLastName' })
  contactLastName: string;

  @Column({ type: 'varchar', length: 50, name: 'contactFirstName' })
  contactFirstName: string;

  @Column({ type: 'varchar', length: 50, name: 'phone' })
  phone: string;

  @Column({ type: 'varchar', length: 50, name: 'addressLine1' })
  addressLine1: string;

  @Column({ type: 'varchar', length: 50, name: 'addressLine2', nullable: true })
  addressLine2?: string;

  @Column({ type: 'varchar', length: 50, name: 'city' })
  city: string;

  @Column({ type: 'varchar', length: 50, name: 'state', nullable: true })
  state?: string;

  @Column({ type: 'varchar', length: 15, name: 'postalCode', nullable: true })
  postalCode?: string;

  @Column({ type: 'varchar', length: 50, name: 'country' })
  country: string;

  @Column({ type: 'int', name: 'salesRepEmployeeNumber', nullable: true })
  salesRepEmployeeNumber?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'creditLimit', nullable: true })
  creditLimit?: number;

  @ManyToOne(() => Employee, (employee) => employee.customers, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'salesRepEmployeeNumber' })
  salesRepEmployee?: Employee;

  @OneToMany(() => Order, (order) => order.customer)
  orders?: Order[];

  @OneToMany(() => Payment, (payment) => payment.customer)
  payments?: Payment[];
}
