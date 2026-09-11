import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { FlagUserDateAuditing } from '../../../common/entities/flag-user-date-auditing.entity';
import { BookingStatus } from '../../../common/constants/booking-status.enum';

import { User } from '../../users/entities/user.entity';
import { Pet } from '../../pets/entities/pet.entity';
import { Order } from '../../orders/entities/order.entity';
import { BookingDetail } from './booking-detail.entity';

@Entity('tbl_bookings')
export class Booking extends FlagUserDateAuditing {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
  })
  id: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: BookingStatus,
    nullable: true,
  })
  status: BookingStatus | null;

  @Column({
    name: 'actual_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  actualPrice: number | null;

  @Column({
    name: 'booking_date',
    type: 'date',
    nullable: true,
  })
  bookingDate: Date | null;

  @Column({
    name: 'start_time',
    type: 'time',
    nullable: true,
  })
  startTime: string | null;

  @Column({
    name: 'end_time',
    type: 'time',
    nullable: true,
  })
  endTime: string | null;

  @ManyToOne(
    () => User,
    (user) => user.bookings,
  )
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @ManyToOne(
    () => Pet,
    (pet) => pet.bookings,
  )
  @JoinColumn({
    name: 'pet_id',
  })
  pet: Pet;

  @OneToMany(
    () => BookingDetail,
    (bookingDetail) => bookingDetail.booking,
    {
      cascade: true,
    },
  )
  bookingDetails: BookingDetail[];

  @ManyToOne(
    () => Order,
    {
      cascade: true,
    },
  )
  @JoinColumn({
    name: 'order_id',
  })
  order: Order;
}
