
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from 'src/modules/users/users.module';

import { Payment } from 'src/modules/payments/entities/payment.entity';
import { PaymentRepository } from 'src/modules/payments/payment.repository';

import { VNPayController } from 'src/modules/payments/controller/vnpay.controller';
import { VNPayService } from 'src/modules/payments/vnpay.service';

import { VNPayUtil } from 'src/common/utils/vnpay.util';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
    ]),
    ConfigModule,
    UsersModule,
  ],
  controllers: [
    VNPayController,
  ],
  providers: [
    PaymentRepository,
    VNPayUtil,
    VNPayService,
  ],
  exports: [
    PaymentRepository,
    VNPayService,
  ],
})
export class PaymentsModule {}

