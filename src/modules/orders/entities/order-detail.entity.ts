import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { DateAuditing } from '../../../common/entities/date-auditing.entity';

import { Order } from './order.entity';
import { Product } from '../../catalogue/products/entities/product.entity';

@Entity('tbl_order_details')
export class OrderDetail extends DateAuditing {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
  })
  id: number;

  @Column({
    name: 'quantity',
    nullable: true,
  })
  quantity: number | null;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  unitPrice: number | null;

  @ManyToOne(
    () => Order,
    (order) => order.orderDetails,
  )
  @JoinColumn({
    name: 'order_id',
  })
  order: Order;

  @ManyToOne(
    () => Product,
    (product) => product.orderDetails,
  )
  @JoinColumn({
    name: 'product_id',
  })
  product: Product;
}
