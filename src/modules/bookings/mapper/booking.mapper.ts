import { Injectable } from '@nestjs/common';

import { Booking } from 'src/modules/bookings/entities/booking.entity';
import { BookingDto } from 'src/modules/bookings/dto/response/booking.dto';
import { BookingDetailMapper } from 'src/modules/bookings/mapper/booking-detail.mapper';

@Injectable()
export class BookingMapper {
  constructor(
    private readonly bookingDetailMapper: BookingDetailMapper,
  ) {}

  toDto(booking: Booking): BookingDto {
    const dto = new BookingDto();

    dto.id = booking.id;
    dto.userId = booking.user?.id ?? null;
    dto.userName = booking.user?.name ?? null;
    dto.status = booking.status;
    dto.actualPrice = booking.actualPrice;
    dto.bookingDate = booking.bookingDate;
    dto.startTime = booking.startTime;
    dto.endTime = booking.endTime;
    dto.petId = booking.pet?.id ?? null;
    dto.petName = booking.pet?.name ?? null;
    dto.orderId = booking.order?.id ?? null;

    dto.bookingDetails = booking.bookingDetails
      ? this.bookingDetailMapper.toDtos(booking.bookingDetails)
      : [];

    dto.createdDate = booking.createdDate;
    dto.lastModifiedDate = booking.lastModifiedDate;

    return dto;
  }

  toDtos(bookings: Booking[]): BookingDto[] {
    return bookings.map((booking) => this.toDto(booking));
  }

  toEntity(dto: BookingDto): Booking {
    return Object.assign(new Booking(), dto);
  }
}
