
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

import { UsersModule } from 'src/modules/users/users.module';
import { CartModule } from 'src/modules/cart/cart.module';
import { ShippingModule } from 'src/modules/shipping/shipping.module';
import { InventoryModule } from 'src/modules/inventory/inventory.module';
import { ProductsModule } from 'src/modules/catalogue/products/products.module';

import { OrderController } from 'src/modules/orders/controller/order.controller';

import { Order } from 'src/modules/orders/entities/order.entity';
import { OrderDetail } from 'src/modules/orders/entities/order-detail.entity';

import { OrderMapper } from 'src/modules/orders/mapper/order.mapper';
import { OrderDetailMapper } from 'src/modules/orders/mapper/order-detail.mapper';

import { OrderRepository } from 'src/modules/orders/repositories/order.repository';
import { OrderDetailRepository } from 'src/modules/orders/repositories/order-detail.repository';

import { OrderServiceImpl } from 'src/modules/orders/service/order.service.impl';

import { Payment } from 'src/modules/payments/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderDetail,
      Payment,
    ]),
    UsersModule,
    CartModule,
    ShippingModule,
    InventoryModule,
    ProductsModule,
  ],

  controllers: [
    OrderController,
  ],

  providers: [
    OrderRepository,
    OrderDetailRepository,

    OrderDetailMapper,
    OrderMapper,

    OrderServiceImpl,
    {
      provide: PROVIDER_TOKEN.ORDER_SERVICE,
      useExisting: OrderServiceImpl,
    },
  ],

  exports: [
    OrderRepository,
    OrderDetailRepository,

    OrderDetailMapper,
    OrderMapper,

    OrderServiceImpl,
    {
      provide: PROVIDER_TOKEN.ORDER_SERVICE,
      useExisting: OrderServiceImpl,
    },
  ],
})
export class OrdersModule {}

