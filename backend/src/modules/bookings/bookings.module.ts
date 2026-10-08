
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

import { UsersModule } from 'src/modules/users/users.module';
import { PetsModule } from 'src/modules/pets/pets.module';
import { ServicesModule } from 'src/modules/catalogue/services/services.module';
import { OrdersModule } from 'src/modules/orders/orders.module';

import { BookingController } from 'src/modules/bookings/booking.controller';

import { Booking } from 'src/modules/bookings/entities/booking.entity';
import { BookingDetail } from 'src/modules/bookings/entities/booking-detail.entity';

import { Payment } from 'src/modules/payments/entities/payment.entity';

import { BookingMapper } from 'src/modules/bookings/mapper/booking.mapper';
import { BookingDetailMapper } from 'src/modules/bookings/mapper/booking-detail.mapper';

import { BookingRepository } from 'src/modules/bookings/repositories/booking.repository';
import { BookingDetailRepository } from 'src/modules/bookings/repositories/booking-detail.repository';

import { BookingServiceImpl } from 'src/modules/bookings/service/booking.service.impl';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      BookingDetail,
      Payment,
    ]),
    UsersModule,
    PetsModule,
    ServicesModule,
    OrdersModule,
  ],
  controllers: [
    BookingController,
  ],
  providers: [
    BookingRepository,
    BookingDetailRepository,
    BookingDetailMapper,
    BookingMapper,
    BookingServiceImpl,
    {
      provide: PROVIDER_TOKEN.BOOKING_SERVICE,
      useExisting: BookingServiceImpl,
    },
  ],
  exports: [
    BookingRepository,
    BookingDetailRepository,
    BookingDetailMapper,
    BookingMapper,
    BookingServiceImpl,
    {
      provide: PROVIDER_TOKEN.BOOKING_SERVICE,
      useExisting: BookingServiceImpl,
    },
  ],
})
export class BookingsModule {}

