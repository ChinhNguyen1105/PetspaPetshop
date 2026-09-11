import { Injectable } from '@nestjs/common';

import { BadRequestException } from 'src/common/exceptions/bad-request.exception';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';

import { BookingStatus } from 'src/common/constants/booking-status.enum';
import { OrderStatus } from 'src/common/constants/order-status.enum';
import { OrderType } from 'src/common/constants/order-type.enum';
import { PaymentStatus } from 'src/common/constants/payment-status.enum';

import {
  Meta,
  ResultPaginationDto,
} from 'src/common/dto/pagination/result-pagination.dto';

import { ReqCreateBookingDto } from 'src/modules/bookings/dto/request/req-create-booking.dto';
import { BookingDto } from 'src/modules/bookings/dto/response/booking.dto';
import { BookingTimeSlotDto } from 'src/modules/bookings/dto/response/booking-time-slot.dto';

import { Booking } from 'src/modules/bookings/entities/booking.entity';
import { BookingDetail } from 'src/modules/bookings/entities/booking-detail.entity';

import { BookingRepository } from 'src/modules/bookings/repositories/booking.repository';
import { BookingDetailRepository } from 'src/modules/bookings/repositories/booking-detail.repository';

import { BookingMapper } from 'src/modules/bookings/mapper/booking.mapper';

import { PetService } from 'src/modules/catalogue/services/entities/pet-service.entity';
import { PetServiceRepository } from 'src/modules/catalogue/services/repositories/pet-service.repository';
import { PetRepository } from 'src/modules/pets/repositories/pet.repository';
import { UserRepository } from 'src/modules/users/repositories/user.repository';
import { OrderRepository } from 'src/modules/orders/repositories/order.repository';

import { Order } from 'src/modules/orders/entities/order.entity';
import { Payment } from 'src/modules/payments/entities/payment.entity';

import { BookingService } from 'src/modules/bookings/service/booking.service';

@Injectable()
export class BookingServiceImpl implements BookingService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly bookingDetailRepository: BookingDetailRepository,
    private readonly petServiceRepository: PetServiceRepository,
    private readonly petRepository: PetRepository,
    private readonly userRepository: UserRepository,
    private readonly bookingMapper: BookingMapper,
    private readonly orderRepository: OrderRepository,
  ) {}

  async createBooking(
    req: ReqCreateBookingDto,
  ): Promise<BookingDto> {
    if (req.startTime >= req.endTime) {
      throw new BadRequestException(
        '[BOOKING] Start time must be before end time',
      );
    }

    const now = new Date();

    const bookingDate = new Date(req.bookingDate);

    const [startHour, startMinute, startSecond = '0'] =
      req.startTime.split(':');

    bookingDate.setHours(
      Number(startHour),
      Number(startMinute),
      Number(startSecond),
      0,
    );

    if (bookingDate < now) {
      throw new BadRequestException(
        '[BOOKING] Booking start time cannot be in the past',
      );
    }

    const user =
      await this.userRepository
        .getRepository()
        .findOne({
          where: {
            id: req.userId,
          },
        });

    if (!user) {
      throw new NotFoundException(
        `[BOOKING] User not found with ID: ${req.userId}`,
      );
    }

    const services: PetService[] = [];

    for (const serviceId of req.serviceIds) {
      const service =
        await this.petServiceRepository
          .getRepository()
          .findOne({
            where: {
              id: serviceId,
            },
          });

      if (!service) {
        throw new NotFoundException(
          `[BOOKING] Service not found with ID: ${serviceId}`,
        );
      }

      if (
        service.deleteFlag === true ||
        service.activeFlag === false
      ) {
        throw new BadRequestException(
          `[BOOKING] Service is disabled: ${service.name}`,
        );
      }

      services.push(service);
    }

    let totalPrice = 0;

    for (const service of services) {
      totalPrice += Number(
        service.basePrice ?? 0,
      );
    }

    const totalDurationMin =
      services.reduce(
        (total, service) =>
          total +
          Number(service.durationMin ?? 0),
        0,
      );

    const availableMinutes =
      this.calculateDurationMinutes(
        req.startTime,
        req.endTime,
      );

    if (
      totalDurationMin >
      availableMinutes
    ) {
      throw new BadRequestException(
        `[BOOKING] Total service duration (${totalDurationMin} min) exceeds available time window (${availableMinutes} min)`,
      );
    }

    const existingBookings =
      await this.bookingRepository
        .findByBookingDateAndStatusNot(
          req.bookingDate,
          BookingStatus.CANCELLED,
        );

    for (const existing of existingBookings) {
      if (
        !existing.startTime ||
        !existing.endTime
      ) {
        continue;
      }

      const startInside =
        req.startTime >= existing.startTime &&
        req.startTime <= existing.endTime;

      const endInside =
        req.endTime >= existing.startTime &&
        req.endTime <= existing.endTime;

      const fullyContains =
        req.startTime < existing.startTime &&
        req.endTime > existing.endTime;

      if (
        startInside ||
        endInside ||
        fullyContains
      ) {
        throw new BadRequestException(
          `[BOOKING] Requested time ${req.startTime}-${req.endTime} conflicts with existing booking ${existing.startTime}-${existing.endTime}`,
        );
      }
    }

    const booking = new Booking();

    booking.user = user;
    booking.bookingDate =
      req.bookingDate;
    booking.startTime =
      req.startTime;
    booking.endTime =
      req.endTime;
    booking.actualPrice =
      totalPrice;
    booking.status =
      BookingStatus.PENDING;

    if (req.petId != null) {
      const pet =
        await this.petRepository
          .getRepository()
          .findOne({
            where: {
              id: req.petId,
            },
          });

      if (!pet) {
        throw new NotFoundException(
          `[BOOKING] Pet not found with ID: ${req.petId}`,
        );
      }

      booking.pet = pet;
    }

    const savedBooking =
      await this.bookingRepository
        .getRepository()
        .save(booking);

    const bookingDetails: BookingDetail[] =
      [];

    for (const service of services) {
      const detail =
        new BookingDetail();

      detail.booking = savedBooking;
      detail.service = service;

      bookingDetails.push(detail);
    }

    await this.bookingDetailRepository
      .getRepository()
      .save(bookingDetails);

    const payment = new Payment();

    payment.status =
      PaymentStatus.PENDING;
    payment.amount =
      totalPrice;

    const order = new Order();

    order.user = user;
    order.totalAmount =
      totalPrice;
    order.status =
      OrderStatus.PENDING;
    order.orderType =
      OrderType.BOOKING;
    order.payment = payment;
    order.orderDetails = [];

    const savedOrder =
      await this.orderRepository
        .getRepository()
        .save(order);

    savedBooking.order =
      savedOrder;

    await this.bookingRepository
      .getRepository()
      .save(savedBooking);

    savedBooking.bookingDetails =
      bookingDetails;

    return this.bookingMapper.toDto(
      savedBooking,
    );
  }

  async getBookingById(
    id: number,
  ): Promise<BookingDto> {
    const booking =
      await this.bookingRepository
        .getRepository()
        .findOne({
          where: {
            id,
          },
          relations: [
            'user',
            'pet',
            'order',
            'bookingDetails',
            'bookingDetails.service',
          ],
        });

    if (!booking) {
      throw new NotFoundException(
        `[BOOKING] Booking not found with ID: ${id}`,
      );
    }

    return this.bookingMapper.toDto(
      booking,
    );
  }

  async getBookedTimeSlots(
    bookingDate: Date,
  ): Promise<BookingTimeSlotDto[]> {
    const bookings =
      await this.bookingRepository
        .findByBookingDateAndStatusNot(
          bookingDate,
          BookingStatus.CANCELLED,
        );

    return bookings
      .filter(
        (booking) =>
          booking.startTime != null &&
          booking.endTime != null,
      )
      .map((booking) => ({
        startTime:
          booking.startTime as string,
        endTime:
          booking.endTime as string,
      }))
      .sort((a, b) =>
        a.startTime.localeCompare(
          b.startTime,
        ),
      );
  }

  async getMyBookings(
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto> {
    throw new BadRequestException(
      '[BOOKING] Current user context is required',
    );
  }

  async getBookingsByStatus(
    status: string,
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto> {
    let bookingStatus: BookingStatus;

    try {
      bookingStatus =
        BookingStatus[
          status
            .toUpperCase()
            .trim() as keyof typeof BookingStatus
        ];
    } catch {
      throw new BadRequestException(
        `[BOOKING] Invalid status: ${status}`,
      );
    }

    if (!bookingStatus) {
      throw new BadRequestException(
        `[BOOKING] Invalid status: ${status}`,
      );
    }

    const [bookings, total] =
      await this.bookingRepository
        .findByStatus(
          bookingStatus,
          page,
          pageSize,
        );

    return this.buildPaginationResponse(
      this.bookingMapper.toDtos(
        bookings,
      ),
      page,
      pageSize,
      total,
    );
  }

  async getAllBookings(
    filter: string[],
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto> {
    const queryBuilder =
      this.bookingRepository
        .getRepository()
        .createQueryBuilder('booking');

    if (filter?.length) {
      for (const expression of filter) {
        const parsed =
          this.parseFilter(expression);

        if (!parsed) {
          continue;
        }

        queryBuilder.andWhere(
          `booking.${parsed.field} ${parsed.operator} :${parsed.parameter}`,
          {
            [parsed.parameter]:
              parsed.value,
          },
        );
      }
    }

    queryBuilder
      .andWhere(
        'booking.deleteFlag = :deleteFlag',
        {
          deleteFlag: false,
        },
      )
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [bookings, total] =
      await queryBuilder.getManyAndCount();

    return this.buildPaginationResponse(
      this.bookingMapper.toDtos(
        bookings,
      ),
      page,
      pageSize,
      total,
    );
  }

  async cancelBooking(
    id: number,
  ): Promise<BookingDto> {
    const booking =
      await this.bookingRepository
        .getRepository()
        .findOne({
          where: {
            id,
          },
          relations: [
            'user',
            'pet',
            'order',
            'bookingDetails',
            'bookingDetails.service',
          ],
        });

    if (!booking) {
      throw new NotFoundException(
        `[BOOKING] Booking not found with ID: ${id}`,
      );
    }

    if (
      booking.status ===
      BookingStatus.CANCELLED
    ) {
      throw new BadRequestException(
        '[BOOKING] Booking is already cancelled',
      );
    }

    if (
      booking.status ===
      BookingStatus.COMPLETED
    ) {
      throw new BadRequestException(
        '[BOOKING] Cannot cancel completed booking',
      );
    }

    booking.status =
      BookingStatus.CANCELLED;

    const updatedBooking =
      await this.bookingRepository
        .getRepository()
        .save(booking);

    return this.bookingMapper.toDto(
      updatedBooking,
    );
  }

  async updateBookingStatus(
    id: number,
    status: string,
  ): Promise<BookingDto> {
    const booking =
      await this.bookingRepository
        .getRepository()
        .findOne({
          where: {
            id,
          },
          relations: [
            'user',
            'pet',
            'order',
            'bookingDetails',
            'bookingDetails.service',
          ],
        });

    if (!booking) {
      throw new NotFoundException(
        `[BOOKING] Booking not found with ID: ${id}`,
      );
    }

    const normalizedStatus =
      status.toUpperCase().trim();

    const newStatus =
      Object.values(
        BookingStatus,
      ).find(
        (value) =>
          value === normalizedStatus,
      );

    if (!newStatus) {
      throw new BadRequestException(
        `[BOOKING] Invalid status: ${status}`,
      );
    }

    if (
      newStatus ===
      BookingStatus.CONFIRMED
    ) {
      this.validateBookingForConfirmation(
        booking,
      );
    }

    booking.status = newStatus;

    const updatedBooking =
      await this.bookingRepository
        .getRepository()
        .save(booking);

    return this.bookingMapper.toDto(
      updatedBooking,
    );
  }

  private validateBookingForConfirmation(
    booking: Booking,
  ): void {
    if (
      !booking.startTime ||
      !booking.endTime
    ) {
      throw new BadRequestException(
        '[BOOKING] Start time and end time are required',
      );
    }

    if (
      booking.startTime >=
      booking.endTime
    ) {
      throw new BadRequestException(
        '[BOOKING] Start time must be before end time',
      );
    }

    if (!booking.bookingDate) {
      throw new BadRequestException(
        '[BOOKING] Booking date is required',
      );
    }

    const startDateTime =
      new Date(booking.bookingDate);

    const [
      hour,
      minute,
      second = '0',
    ] = booking.startTime.split(':');

    startDateTime.setHours(
      Number(hour),
      Number(minute),
      Number(second),
      0,
    );

    if (
      startDateTime <
      new Date()
    ) {
      throw new BadRequestException(
        '[BOOKING] Booking start time cannot be in the past',
      );
    }

    const details =
      booking.bookingDetails ?? [];

    if (details.length === 0) {
      throw new BadRequestException(
        '[BOOKING] Booking must contain at least one service',
      );
    }

    const services: PetService[] = [];

    for (const detail of details) {
      const service =
        detail.service;

      if (!service) {
        throw new NotFoundException(
          '[BOOKING] Booking service not found in booking details',
        );
      }

      if (
        service.deleteFlag === true ||
        service.activeFlag === false
      ) {
        throw new BadRequestException(
          `[BOOKING] Service is disabled: ${service.name}`,
        );
      }

      services.push(service);
    }

    const totalDurationMin =
      services.reduce(
        (total, service) =>
          total +
          Number(service.durationMin ?? 0),
        0,
      );

    const availableMinutes =
      this.calculateDurationMinutes(
        booking.startTime,
        booking.endTime,
      );

    if (
      totalDurationMin >
      availableMinutes
    ) {
      throw new BadRequestException(
        `[BOOKING] Total service duration (${totalDurationMin} min) exceeds available time window (${availableMinutes} min)`,
      );
    }
  }

  private calculateDurationMinutes(
    startTime: string,
    endTime: string,
  ): number {
    const start =
      this.timeToMinutes(startTime);

    const end =
      this.timeToMinutes(endTime);

    return end - start;
  }

  private timeToMinutes(
    value: string,
  ): number {
    const [
      hour,
      minute,
      second = '0',
    ] = value.split(':');

    return (
      Number(hour) * 60 +
      Number(minute) +
      Number(second) / 60
    );
  }

  private parseFilter(
    expression: string,
  ): {
    field: string;
    operator: string;
    parameter: string;
    value: string;
  } | null {
    const operators = [
      '>=',
      '<=',
      '!=',
      '>',
      '<',
      ':',
      '~',
    ];

    for (const operator of operators) {
      const index =
        expression.indexOf(operator);

      if (index === -1) {
        continue;
      }

      const field =
        expression
          .substring(0, index)
          .trim();

      const value =
        expression
          .substring(
            index + operator.length,
          )
          .trim();

      if (!field) {
        return null;
      }

      let sqlOperator = '=';

      switch (operator) {
        case '!=':
          sqlOperator = '<>';
          break;
        case '>':
          sqlOperator = '>';
          break;
        case '<':
          sqlOperator = '<';
          break;
        case '>=':
          sqlOperator = '>=';
          break;
        case '<=':
          sqlOperator = '<=';
          break;
        case '~':
          sqlOperator = 'LIKE';
          break;
        default:
          sqlOperator = '=';
      }

      const parameter =
        `filter_${Math.random()
          .toString(36)
          .slice(2, 10)}`;

      return {
        field,
        operator: sqlOperator,
        parameter,
        value:
          operator === '~'
            ? `%${value}%`
            : value,
      };
    }

    return null;
  }

  private buildPaginationResponse(
    data: BookingDto[],
    page: number,
    pageSize: number,
    total: number,
  ): ResultPaginationDto {
    const response =
      new ResultPaginationDto();

    response.result = data;

    const meta =
      new Meta();

    meta.page = page;
    meta.pageSize = pageSize;
    meta.pages =
      pageSize > 0
        ? Math.ceil(
            total / pageSize,
          )
        : 0;
    meta.total = total;

    response.meta = meta;

    return response;
  }
}
