import { Entity, Column, ManyToOne, ForeignKey } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Order } from './order.entity';

@Entity('order_status_history')
export class OrderStatusHistory extends BaseEntity {
  @Column()
  @ForeignKey(() => Order)
  orderId: string;

  @Column({ nullable: true })
  oldStatus: string;

  @Column()
  newStatus: string;

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  changedBy: string; // User ID or system

  @ManyToOne(() => Order, (order) => order.statusHistory, {
    onDelete: 'CASCADE',
  })
  order: Order;
}
