import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';

import { ReqCreateBookingDto } from 'src/modules/bookings/dto/request/req-create-booking.dto';
import { BookingDto } from 'src/modules/bookings/dto/response/booking.dto';
import { BookingTimeSlotDto } from 'src/modules/bookings/dto/response/booking-time-slot.dto';

export interface BookingService {
  createBooking(
    req: ReqCreateBookingDto,
  ): Promise<BookingDto>;

  getBookingById(
    id: number,
  ): Promise<BookingDto>;

  getMyBookings(
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto>;

  getBookingsByStatus(
    status: string,
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto>;

  getAllBookings(
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto>;

  getBookedTimeSlots(
    bookingDate: Date,
  ): Promise<BookingTimeSlotDto[]>;

  cancelBooking(
    id: number,
  ): Promise<BookingDto>;

  updateBookingStatus(
    id: number,
    status: string,
  ): Promise<BookingDto>;
}
