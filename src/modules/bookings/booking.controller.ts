import {
  Body,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import { VsResponseUtil } from 'src/common/base/vs-response.util';

import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';
import { UrlConstant } from 'src/common/constants/url.constant';

import { ReqBookingDateDto } from 'src/modules/bookings/dto/request/req-booking-date.dto';
import { ReqCreateBookingDto } from 'src/modules/bookings/dto/request/req-create-booking.dto';

import type { BookingService } from 'src/modules/bookings/service/booking.service';

@RestApiV1()
export class BookingController {
  constructor(
    @Inject(PROVIDER_TOKEN.BOOKING_SERVICE)
    private readonly bookingService: BookingService,
  ) {}

  @Post(UrlConstant.Booking.CREATE_BOOKING)
  async createBooking(@Body() req: ReqCreateBookingDto) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.CREATED,
      await this.bookingService.createBooking(req),
    );
  }

  @Get(UrlConstant.Booking.GET_BOOKING)
  async getBooking(@Param('id') id: number) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.bookingService.getBookingById(id),
    );
  }

  @Get(UrlConstant.Booking.GET_MY_BOOKINGS)
  async getMyBookings(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.bookingService.getMyBookings(page, pageSize),
    );
  }

  @Get(UrlConstant.Booking.GET_BOOKINGS_BY_STATUS)
  async getBookingsByStatus(
    @Query('status') status: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.bookingService.getBookingsByStatus(status, page, pageSize),
    );
  }

  @Get(UrlConstant.Booking.GET_ALL_BOOKINGS)
  async getAllBookings(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.bookingService.getAllBookings(page, pageSize),
    );
  }

  @Get(UrlConstant.Booking.GET_BOOKED_TIMES)
  async getOccupiedBookingTimes(@Query() reqDto: ReqBookingDateDto) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.bookingService.getBookedTimeSlots(reqDto.bookingDate),
    );
  }

  @Patch(UrlConstant.Booking.CANCEL_BOOKING)
  async cancelBooking(@Param('id') id: number) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.bookingService.cancelBooking(id),
    );
  }

  @Patch(UrlConstant.Booking.UPDATE_BOOKING_STATUS)
  async updateBookingStatus(
    @Param('id') id: number,
    @Query('status') status: string,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.bookingService.updateBookingStatus(id, status),
    );
  }
}
