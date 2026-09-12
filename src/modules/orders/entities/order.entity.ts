import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { FlagUserDateAuditing } from '../../../common/entities/flag-user-date-auditing.entity';
import { OrderStatus } from '../../../common/constants/order-status.enum';
import { OrderType } from '../../../common/constants/order-type.enum';

import { Payment } from '../../payments/entities/payment.entity';
import { User } from '../../users/entities/user.entity';
import { OrderDetail } from './order-detail.entity';

@Entity('tbl_orders')
export class Order extends FlagUserDateAuditing {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
  })
  id: number;

  @Column({
    name: 'shipping_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  shippingName: string | null;

  @Column({
    name: 'shipping_phone',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  shippingPhone: string | null;

  @Column({
    name: 'shipping_address_full',
    type: 'text',
    nullable: true,
  })
  shippingAddressFull: string | null;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  totalAmount: number | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: OrderStatus,
    nullable: true,
  })
  status: OrderStatus | null;

  @OneToOne(() => Payment, (payment) => payment.order, {
    cascade: true,
  })
  @JoinColumn({
    name: 'payment_id',
  })
  payment: Payment;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  orderDetails: OrderDetail[];

  @Column({
    name: 'order_type',
    type: 'enum',
    enum: OrderType,
    nullable: true,
    default: OrderType.PRODUCT,
  })
  orderType: OrderType;
}
