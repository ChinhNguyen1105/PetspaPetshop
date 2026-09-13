
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

import { UsersModule } from 'src/modules/users/users.module';

import { ShippingAddressController } from 'src/modules/shipping/controller/shipping-address.controller';

import { ShippingAddress } from 'src/modules/shipping/entities/shipping-address.entity';

import { ShippingAddressMapper } from 'src/modules/shipping/mapper/shipping-address.mapper';

import { ShippingAddressRepository } from 'src/modules/shipping/repositories/shipping-address.repository';

import { ShippingAddressServiceImpl } from 'src/modules/shipping/service/shipping-address.service.impl';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShippingAddress,
    ]),
    UsersModule,
  ],
  controllers: [
    ShippingAddressController,
  ],
  providers: [
    ShippingAddressRepository,
    ShippingAddressMapper,

    ShippingAddressServiceImpl,
    {
      provide: PROVIDER_TOKEN.SHIPPING_ADDRESS_SERVICE,
      useExisting: ShippingAddressServiceImpl,
    },
  ],
  exports: [
    ShippingAddressRepository,
    ShippingAddressMapper,

    ShippingAddressServiceImpl,
    {
      provide: PROVIDER_TOKEN.SHIPPING_ADDRESS_SERVICE,
      useExisting: ShippingAddressServiceImpl,
    },
  ],
})
export class ShippingModule {}

