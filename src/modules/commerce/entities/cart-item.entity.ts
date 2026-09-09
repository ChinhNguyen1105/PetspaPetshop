import { Entity, Column, ManyToOne, ForeignKey } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Cart } from './cart.entity';
import { Product } from '../../catalogue/entities/product.entity';

@Entity('cart_items')
export class CartItem extends BaseEntity {
  @Column()
  @ForeignKey(() => Cart)
  cartId: string;

  @Column()
  @ForeignKey(() => Product)
  productId: string;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number; // Price at time of adding to cart

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  cart: Cart;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product: Product;
}
