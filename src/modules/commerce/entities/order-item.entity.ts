import { Entity, Column, ManyToOne, ForeignKey } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Order } from './order.entity';
import { Product } from '../../catalogue/entities/product.entity';

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @Column()
  @ForeignKey(() => Order)
  orderId: string;

  @Column()
  @ForeignKey(() => Product)
  productId: string;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  priceAtPurchase: number; // Locked price at purchase time

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
  product: Product;
}
