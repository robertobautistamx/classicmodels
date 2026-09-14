import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('offices')
export class Office {
  @PrimaryColumn({ type: 'varchar', length: 10, name: 'officeCode' })
  officeCode: string;

  @Column({ type: 'varchar', length: 50, name: 'city' })
  city: string;

  @Column({ type: 'varchar', length: 50, name: 'phone' })
  phone: string;

  @Column({ type: 'varchar', length: 50, name: 'addressLine1' })
  addressLine1: string;

  @Column({ type: 'varchar', length: 50, name: 'addressLine2', nullable: true })
  addressLine2?: string;

  @Column({ type: 'varchar', length: 50, name: 'state', nullable: true })
  state?: string;

  @Column({ type: 'varchar', length: 50, name: 'country' })
  country: string;

  @Column({ type: 'varchar', length: 15, name: 'postalCode' })
  postalCode: string;

  @Column({ type: 'varchar', length: 10, name: 'territory' })
  territory: string;

  @OneToMany(() => Employee, (employee) => employee.office)
  employees?: Employee[];
}
