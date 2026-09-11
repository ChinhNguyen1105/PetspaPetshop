import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { FlagUserDateAuditing } from '../../../common/entities/flag-user-date-auditing.entity';

import { User } from '../../users/entities/user.entity';
import { Product } from '../../catalogue/products/entities/product.entity';

@Entity('tbl_product_reviews')
export class ProductReview extends FlagUserDateAuditing {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
  })
  id: number;

  @ManyToOne(
    () => User,
    (user) => user.reviews,
  )
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @ManyToOne(
    () => Product,
    (product) => product.productReviews,
  )
  @JoinColumn({
    name: 'product_id',
  })
  product: Product;

  @Column({
    name: 'rating',
    nullable: false,
  })
  rating: number;

  @Column({
    name: 'comment',
    type: 'text',
    nullable: true,
  })
  comment: string | null;
}
