import { Entity, Column, ManyToOne, ForeignKey } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from './product.entity';

@Entity('product_images')
export class ProductImage extends BaseEntity {
  @Column()
  url: string;

  @Column({ nullable: true })
  altText: string;

  @Column({ default: false })
  isMain: boolean;

  @Column()
  @ForeignKey(() => Product)
  productId: string;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  product: Product;
}
