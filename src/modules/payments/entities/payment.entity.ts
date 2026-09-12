import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserDateAuditing } from '../../../common/entities/user-date-auditing.entity';
import { PaymentMethod } from '../../../common/constants/payment-method.enum';
import { PaymentStatus } from '../../../common/constants/payment-status.enum';

import { Order } from '../../orders/entities/order.entity';

@Entity('tbl_payments')
export class Payment extends UserDateAuditing {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
  })
  id: number;

  @OneToOne(() => Order, (order) => order.payment)
  @JoinColumn({ name: 'order_id' }) // Chỉ định rõ khóa ngoại liên kết tới bảng Order
  order: Order;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod: PaymentMethod | null;

  @Column({
    name: 'transaction_id',
    type: 'varchar', // Bắt buộc khai báo kiểu dữ liệu cho chuỗi
    length: 255,
    unique: true,
    nullable: true,
  })
  transactionId: string | null;

  @Column({
    name: 'amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  amount: number | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PaymentStatus,
    nullable: true,
  })
  status: PaymentStatus | null;
}
