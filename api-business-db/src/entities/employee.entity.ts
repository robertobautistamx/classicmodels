import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Office } from './office.entity';
import { Customer } from './customer.entity';

@Entity('employees')
export class Employee {
  @PrimaryColumn({ type: 'int', name: 'employeeNumber' })
  employeeNumber: number;

  @Column({ type: 'varchar', length: 50, name: 'lastName' })
  lastName: string;

  @Column({ type: 'varchar', length: 50, name: 'firstName' })
  firstName: string;

  @Column({ type: 'varchar', length: 10, name: 'extension' })
  extension: string;

  @Column({ type: 'varchar', length: 100, name: 'email' })
  email: string;

  @Column({ type: 'varchar', length: 10, name: 'officeCode' })
  officeCode: string;

  @Column({ type: 'int', name: 'reportsTo', nullable: true })
  reportsTo?: number;

  @Column({ type: 'varchar', length: 50, name: 'jobTitle' })
  jobTitle: string;

  @ManyToOne(() => Office, (office) => office.employees, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'officeCode' })
  office?: Office;

  @ManyToOne(() => Employee, (emp) => emp.subordinates, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'reportsTo' })
  manager?: Employee;

  @OneToMany(() => Employee, (emp) => emp.manager)
  subordinates?: Employee[];

  @OneToMany(() => Customer, (customer) => customer.salesRepEmployee)
  customers?: Customer[];
}
