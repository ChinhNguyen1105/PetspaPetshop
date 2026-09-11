import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Booking } from 'src/modules/bookings/entities/booking.entity';
import { BookingStatus } from 'src/common/constants/booking-status.enum';

@Injectable()
export class BookingRepository {
  constructor(
    @InjectRepository(Booking)
    private readonly repository: Repository<Booking>,
  ) {}

  findByUserId(
    userId: string,
    page: number,
    pageSize: number,
  ) {
    return this.repository
      .createQueryBuilder('booking')
      .leftJoin('booking.user', 'user')
      .where('user.id = :userId', { userId })
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
  }

  findByUserIdAndStatus(
    userId: string,
    status: BookingStatus,
    page: number,
    pageSize: number,
  ) {
    return this.repository
      .createQueryBuilder('booking')
      .leftJoin('booking.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('booking.status = :status', { status })
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
  }

  findByBookingDateAndStatusNot(
    bookingDate: Date,
    status: BookingStatus,
  ) {
    return this.repository
      .createQueryBuilder('booking')
      .where('booking.bookingDate = :bookingDate', { bookingDate })
      .andWhere('booking.status != :status', { status })
      .getMany();
  }

  findByStatusNotAndDeleteFlagFalseAndActiveFlagTrue(
    status: BookingStatus,
  ) {
    return this.repository
      .createQueryBuilder('booking')
      .where('booking.status != :status', { status })
      .andWhere('booking.deleteFlag = false')
      .andWhere('booking.activeFlag = true')
      .getMany();
  }

  findByStartTimeBetween(
    startTime: Date,
    endTime: Date,
  ) {
    return this.repository
      .createQueryBuilder('booking')
      .where('booking.startTime BETWEEN :startTime AND :endTime', {
        startTime,
        endTime,
      })
      .getMany();
  }

  findByStatus(
    status: BookingStatus,
    page: number,
    pageSize: number,
  ) {
    return this.repository
      .createQueryBuilder('booking')
      .where('booking.status = :status', { status })
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
  }

  countByStatus(status: BookingStatus) {
    return this.repository
      .createQueryBuilder('booking')
      .where('booking.status = :status', { status })
      .getCount();
  }

  findByOrderId(orderId: number) {
    return this.repository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.order', 'order')
      .where('order.id = :orderId', { orderId })
      .getOne();
  }

  getRepository(): Repository<Booking> {
    return this.repository;
  }
}
