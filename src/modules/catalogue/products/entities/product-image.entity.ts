import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { DateAuditing } from '../../../../common/entities/date-auditing.entity';
import { Product } from './product.entity';

@Entity('tbl_product_images')
export class ProductImage extends DateAuditing {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
  })
  id: number;

  @Column({
    name: 'image_url',
    nullable: true,
  })
  imageUrl: string | null;

  @Column({
    name: 'is_main',
    nullable: true,
    default: false,
  })
  isThumbnail: boolean;

  @ManyToOne(
    () => Product,
    (product) => product.productImages,
  )
  @JoinColumn({
    name: 'product_id',
  })
  product: Product;
}
