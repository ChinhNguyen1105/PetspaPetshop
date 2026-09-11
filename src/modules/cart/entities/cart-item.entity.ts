import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { DateAuditing } from '../../../common/entities/date-auditing.entity';

import { Product } from '../../catalogue/products/entities/product.entity';
import { Cart } from './cart.entity';

@Entity('tbl_cart_items')
export class CartItem extends DateAuditing {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
  })
  id: number;

  @ManyToOne(
    () => Product,
    (product) => product.cartItems,
  )
  @JoinColumn({
    name: 'product_id',
  })
  product: Product;

  @ManyToOne(
    () => Cart,
    (cart) => cart.cartItems,
  )
  @JoinColumn({
    name: 'cart_id',
  })
  cart: Cart;

  @Column({
    name: 'quantity',
    nullable: false,
  })
  quantity: number;
}
