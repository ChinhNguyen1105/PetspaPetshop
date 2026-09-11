import { Injectable } from '@nestjs/common';

import { BookingDetail } from 'src/modules/bookings/entities/booking-detail.entity';
import { BookingDetailDto } from 'src/modules/bookings/dto/response/booking-detail.dto';

@Injectable()
export class BookingDetailMapper {
  toDto(bookingDetail: BookingDetail): BookingDetailDto {
    const dto = Object.assign(new BookingDetailDto(), bookingDetail);

    dto.bookingId = bookingDetail.booking?.id ?? null;
    dto.serviceId = bookingDetail.service?.id ?? null;
    dto.serviceName = bookingDetail.service?.name ?? null;
    dto.servicePrice = bookingDetail.service?.basePrice ?? null;
    dto.serviceDuration = bookingDetail.service?.durationMin ?? null;

    return dto;
  }

  toDtos(bookingDetails: BookingDetail[]): BookingDetailDto[] {
    return bookingDetails.map((detail) => this.toDto(detail));
  }

  toEntity(dto: BookingDetailDto): BookingDetail {
    return Object.assign(new BookingDetail(), dto);
  }
}
