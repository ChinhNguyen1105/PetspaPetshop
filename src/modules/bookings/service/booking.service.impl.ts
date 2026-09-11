import {
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { DataSource, EntityManager } from 'typeorm';
import type { Request } from 'express';

import { BadRequestException as AppBadRequestException } from 'src/common/exceptions/bad-request.exception';
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

import { User } from 'src/modules/users/entities/user.entity';
import { Pet } from 'src/modules/pets/entities/pet.entity';
import { Order } from 'src/modules/orders/entities/order.entity';
import { Payment } from 'src/modules/payments/entities/payment.entity';

import { SecurityUtil } from 'src/modules/auth/security/security.util';
import { BookingService } from 'src/modules/bookings/service/booking.service';

@Injectable({ scope: Scope.REQUEST })
export class BookingServiceImpl implements BookingService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly bookingDetailRepository: BookingDetailRepository,
    private readonly petServiceRepository: PetServiceRepository,
    private readonly petRepository: PetRepository,
    private readonly userRepository: UserRepository,
    private readonly bookingMapper: BookingMapper,
    private readonly orderRepository: OrderRepository,
    private readonly dataSource: DataSource,
    @Inject(REQUEST)
    private readonly request: Request,
  ) {}

  async createBooking(
    req: ReqCreateBookingDto,
  ): Promise<BookingDto> {
    return this.dataSource.transaction(
      async (manager: EntityManager) => {
        if (req.startTime > req.endTime) {
          throw new AppBadRequestException(
            '[BOOKING] Start time must be before end time',
          );
        }

        const startDateTime =
          this.combineDateAndTime(
            req.bookingDate,
            req.startTime,
          );

        if (startDateTime < new Date()) {
          throw new AppBadRequestException(
            '[BOOKING] Booking start time cannot be in the past',
          );
        }

        const user =
          await manager
            .getRepository(User)
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
            await manager
              .getRepository(PetService)
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
            throw new AppBadRequestException(
              `[BOOKING] Service is disabled: ${service.name}`,
            );
          }

          services.push(service);
        }

        let totalPrice = 0;

        for (const service of services) {
          totalPrice += Number(service.basePrice);
        }

        const totalDurationMin =
          services.reduce(
            (total, service) =>
              total + Number(service.durationMin),
            0,
          );

        const availableMinutes =
          this.calculateDurationMinutes(
            req.startTime,
            req.endTime,
          );

        if (totalDurationMin > availableMinutes) {
          throw new AppBadRequestException(
            `[BOOKING] Total service duration (${totalDurationMin} min) exceeds available time window (${availableMinutes} min)`,
          );
        }

        const existingBookings =
          await manager
            .getRepository(Booking)
            .createQueryBuilder('booking')
            .where(
              'booking.bookingDate = :bookingDate',
              {
                bookingDate: req.bookingDate,
              },
            )
            .andWhere(
              'booking.status != :status',
              {
                status: BookingStatus.CANCELLED,
              },
            )
            .getMany();

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
            throw new AppBadRequestException(
              `[BOOKING] Requested time ${req.startTime}-${req.endTime} conflicts with existing booking ${existing.startTime}-${existing.endTime}`,
            );
          }
        }

        const booking = new Booking();

        booking.user = user;
        booking.bookingDate = req.bookingDate;
        booking.startTime = req.startTime;
        booking.endTime = req.endTime;
        booking.actualPrice = totalPrice;
        booking.status = BookingStatus.PENDING;

        if (req.petId != null) {
          const pet =
            await manager
              .getRepository(Pet)
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
          await manager
            .getRepository(Booking)
            .save(booking);

        const bookingDetails: BookingDetail[] = [];

        for (const service of services) {
          const detail = new BookingDetail();

          detail.booking = savedBooking;
          detail.service = service;

          bookingDetails.push(detail);
        }

        await manager
          .getRepository(BookingDetail)
          .save(bookingDetails);

        const payment = new Payment();

        payment.status = PaymentStatus.PENDING;
        payment.amount = totalPrice;

        const order = new Order();

        order.user = user;
        order.totalAmount = totalPrice;
        order.status = OrderStatus.PENDING;
        order.orderType = OrderType.BOOKING;
        order.payment = payment;
        order.orderDetails = [];

        const savedOrder =
          await manager
            .getRepository(Order)
            .save(order);

        savedBooking.order = savedOrder;

        await manager
          .getRepository(Booking)
          .save(savedBooking);

        savedBooking.bookingDetails = bookingDetails;

        return this.bookingMapper.toDto(
          savedBooking,
        );
      },
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

    return this.bookingMapper.toDto(booking);
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
      .map((booking) => {
        const timeSlot =
          new BookingTimeSlotDto();

        timeSlot.startTime =
          booking.startTime as string;

        timeSlot.endTime =
          booking.endTime as string;

        return timeSlot;
      })
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
    const currentUser =
      SecurityUtil.getCurrentUserLogin(
        this.request,
      );

    if (!currentUser) {
      throw new AppBadRequestException(
        '[BOOKING] Current user not authenticated',
      );
    }

    const [bookings, total] =
      await this.bookingRepository.findByUserId(
        currentUser,
        page,
        pageSize,
      );

    return this.buildPaginationResponse(
      this.bookingMapper.toDtos(bookings),
      page,
      pageSize,
      total,
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
          status.toUpperCase() as keyof typeof BookingStatus
        ];

      if (!bookingStatus) {
        throw new Error();
      }
    } catch {
      throw new AppBadRequestException(
        `[BOOKING] Invalid status: ${status}`,
      );
    }

    const [bookings, total] =
      await this.bookingRepository.findByStatus(
        bookingStatus,
        page,
        pageSize,
      );

    return this.buildPaginationResponse(
      this.bookingMapper.toDtos(bookings),
      page,
      pageSize,
      total,
    );
  }

  async getAllBookings(
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto> {
    const queryBuilder =
      this.bookingRepository
        .getRepository()
        .createQueryBuilder('booking')
        .skip((page - 1) * pageSize)
        .take(pageSize);

    const [bookings, total] =
      await queryBuilder.getManyAndCount();

    return this.buildPaginationResponse(
      this.bookingMapper.toDtos(bookings),
      page,
      pageSize,
      total,
    );
  }

  async cancelBooking(
    id: number,
  ): Promise<BookingDto> {
    return this.dataSource.transaction(
      async (manager: EntityManager) => {
        const booking =
          await manager
            .getRepository(Booking)
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
          throw new AppBadRequestException(
            '[BOOKING] Booking is already cancelled',
          );
        }

        if (
          booking.status ===
          BookingStatus.COMPLETED
        ) {
          throw new AppBadRequestException(
            '[BOOKING] Cannot cancel completed booking',
          );
        }

        booking.status =
          BookingStatus.CANCELLED;

        const updatedBooking =
          await manager
            .getRepository(Booking)
            .save(booking);

        return this.bookingMapper.toDto(
          updatedBooking,
        );
      },
    );
  }

  async updateBookingStatus(
    id: number,
    status: string,
  ): Promise<BookingDto> {
    return this.dataSource.transaction(
      async (manager: EntityManager) => {
        const booking =
          await manager
            .getRepository(Booking)
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

        let newStatus: BookingStatus;

        try {
          newStatus =
            BookingStatus[
              status.toUpperCase() as keyof typeof BookingStatus
            ];

          if (!newStatus) {
            throw new Error();
          }
        } catch {
          throw new AppBadRequestException(
            `[BOOKING] Invalid status: ${status}`,
          );
        }

        if (
          newStatus ===
          BookingStatus.CONFIRMED
        ) {
          await this.validateBookingForConfirmation(
            booking,
            manager,
          );
        }

        booking.status = newStatus;

        const updatedBooking =
          await manager
            .getRepository(Booking)
            .save(booking);

        return this.bookingMapper.toDto(
          updatedBooking,
        );
      },
    );
  }

  private async validateBookingForConfirmation(
    booking: Booking,
    manager: EntityManager,
  ): Promise<void> {
    if (
      !booking.startTime ||
      !booking.endTime
    ) {
      throw new AppBadRequestException(
        '[BOOKING] Start time and end time are required',
      );
    }

    if (
      booking.startTime >
      booking.endTime
    ) {
      throw new AppBadRequestException(
        '[BOOKING] Start time must be before end time',
      );
    }

    if (!booking.bookingDate) {
      throw new AppBadRequestException(
        '[BOOKING] Booking date is required',
      );
    }

    const startDateTime =
      this.combineDateAndTime(
        booking.bookingDate,
        booking.startTime,
      );

    if (startDateTime < new Date()) {
      throw new AppBadRequestException(
        '[BOOKING] Booking start time cannot be in the past',
      );
    }

    if (
      !booking.bookingDetails ||
      booking.bookingDetails.length === 0
    ) {
      throw new AppBadRequestException(
        '[BOOKING] Booking must contain at least one service',
      );
    }

    const services: PetService[] = [];

    for (const detail of booking.bookingDetails) {
      const service = detail.service;

      if (!service) {
        throw new NotFoundException(
          '[BOOKING] Booking service not found in booking details',
        );
      }

      if (
        service.deleteFlag === true ||
        service.activeFlag === false
      ) {
        throw new AppBadRequestException(
          `[BOOKING] Service is disabled: ${service.name}`,
        );
      }

      services.push(service);
    }

    const totalDurationMin =
      services.reduce(
        (total, service) =>
          total + Number(service.durationMin),
        0,
      );

    const availableMinutes =
      this.calculateDurationMinutes(
        booking.startTime,
        booking.endTime,
      );

    if (totalDurationMin > availableMinutes) {
      throw new AppBadRequestException(
        `[BOOKING] Total service duration (${totalDurationMin} min) exceeds available time window (${availableMinutes} min)`,
      );
    }

    const existingBookings =
      await manager
        .getRepository(Booking)
        .createQueryBuilder('booking')
        .where(
          'booking.bookingDate = :bookingDate',
          {
            bookingDate:
              booking.bookingDate,
          },
        )
        .andWhere(
          'booking.status != :status',
          {
            status:
              BookingStatus.CANCELLED,
          },
        )
        .getMany();

    for (const existing of existingBookings) {
      if (existing.id === booking.id) {
        continue;
      }

      if (
        !existing.startTime ||
        !existing.endTime
      ) {
        continue;
      }

      const startInside =
        booking.startTime >=
          existing.startTime &&
        booking.startTime <=
          existing.endTime;

      const endInside =
        booking.endTime >=
          existing.startTime &&
        booking.endTime <=
          existing.endTime;

      const fullyContains =
        booking.startTime <
          existing.startTime &&
        booking.endTime >
          existing.endTime;

      if (
        startInside ||
        endInside ||
        fullyContains
      ) {
        throw new AppBadRequestException(
          `[BOOKING] Requested time ${booking.startTime}-${booking.endTime} conflicts with existing booking ${existing.startTime}-${existing.endTime}`,
        );
      }
    }
  }

  private calculateDurationMinutes(
    startTime: string,
    endTime: string,
  ): number {
    return (
      this.timeToMinutes(endTime) -
      this.timeToMinutes(startTime)
    );
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

  private combineDateAndTime(
    date: Date,
    time: string,
  ): Date {
    const result = new Date(date);

    const [
      hour,
      minute,
      second = '0',
    ] = time.split(':');

    result.setHours(
      Number(hour),
      Number(minute),
      Number(second),
      0,
    );

    return result;
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

    const meta = new Meta();

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
