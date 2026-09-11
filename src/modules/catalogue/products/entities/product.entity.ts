import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { FlagUserDateAuditing } from '../../../../common/entities/flag-user-date-auditing.entity';

import { Inventory } from '../../../inventory/entities/inventory.entity';
import { ProductImage } from './product-image.entity';
import { CartItem } from '../../../cart/entities/cart-item.entity';
import { OrderDetail } from '../../../orders/entities/order-detail.entity';
import { Category } from '../../categories/entities/category.entity';
import { ProductReview } from '../../../reviews/entities/product-review.entity';

@Entity('tbl_products')
export class Product extends FlagUserDateAuditing {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
  })
  id: number;

  @Column({
    name: 'name',
    nullable: true,
  })
  name: string | null;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    name: 'price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  price: number | null;

  @OneToOne(
    () => Inventory,
    (inventory) => inventory.product,
  )
  inventory: Inventory;

  @OneToMany(
    () => ProductImage,
    (productImage) => productImage.product,
  )
  productImages: ProductImage[];

  @OneToMany(
    () => CartItem,
    (cartItem) => cartItem.product,
  )
  cartItems: CartItem[];

  @OneToMany(
    () => OrderDetail,
    (orderDetail) => orderDetail.product,
  )
  orderDetails: OrderDetail[];

  @ManyToOne(
    () => Category,
    (category) => category.products,
  )
  @JoinColumn({
    name: 'category_id',
  })
  category: Category;

  @OneToMany(
    () => ProductReview,
    (productReview) => productReview.product,
  )
  productReviews: ProductReview[];

  @Column({
    name: 'avg_rating',
    nullable: true,
    default: 0.0,
  })
  avgRating: number;

  @Column({
    name: 'total_reviews',
    nullable: true,
    default: 0,
  })
  totalReviews: number;
}
