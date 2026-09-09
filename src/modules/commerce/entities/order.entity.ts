import { Entity, Column, ManyToOne, ForeignKey, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../auth/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatusHistory } from './order-status-history.entity';

@Entity('orders')
export class Order extends BaseEntity {
  @Column()
  @ForeignKey(() => User)
  userId: string;

  @Column({ default: 'PENDING' })
  status: string; // PENDING, SHIPPED, DELIVERED, CANCELLED

  @Column('decimal', { precision: 12, scale: 2 })
  totalPrice: number;

  @Column({ nullable: true })
  shippingAddressSnapshot: string; // JSON snapshot of address at order time

  @Column({ default: 'PENDING' })
  paymentStatus: string; // PENDING, PROCESSING, SUCCESS, FAILED, REFUNDED

  @Column({ nullable: true })
  paymentMethod: string; // VNPAY, COD, etc.

  @Column({ nullable: true })
  paymentReference: string; // VNPay transaction ID

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @OneToMany(() => OrderStatusHistory, (history) => history.order)
  statusHistory: OrderStatusHistory[];
}
