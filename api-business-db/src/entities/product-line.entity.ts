import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity('productlines')
export class ProductLine {
  @PrimaryColumn({ type: 'varchar', length: 50, name: 'productLine' })
  productLine: string;

  @Column({ type: 'varchar', length: 4000, name: 'textDescription', nullable: true })
  textDescription?: string;

  @Column({ type: 'mediumtext', name: 'htmlDescription', nullable: true })
  htmlDescription?: string;

  @Column({ type: 'mediumblob', name: 'image', nullable: true })
  image?: Buffer;

  @OneToMany(() => Product, (product) => product.productLineEntity)
  products?: Product[];
}
