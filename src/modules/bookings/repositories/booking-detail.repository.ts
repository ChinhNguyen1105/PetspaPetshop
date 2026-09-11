import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BookingDetail } from 'src/modules/bookings/entities/booking-detail.entity';

@Injectable()
export class BookingDetailRepository {
  constructor(
    @InjectRepository(BookingDetail)
    private readonly repository: Repository<BookingDetail>,
  ) {}

  findByBookingId(bookingId: number) {
    return this.repository
      .createQueryBuilder('bookingDetail')
      .leftJoinAndSelect('bookingDetail.booking', 'booking')
      .where('booking.id = :bookingId', { bookingId })
      .getMany();
  }

  deleteByBookingId(bookingId: number) {
    return this.repository
      .createQueryBuilder()
      .delete()
      .from(BookingDetail)
      .where('bookingId = :bookingId', { bookingId })
      .execute();
  }

  getRepository(): Repository<BookingDetail> {
    return this.repository;
  }
}
