
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

import { UsersModule } from 'src/modules/users/users.module';
import { ProductsModule } from 'src/modules/catalogue/products/products.module';
import { InventoryModule } from 'src/modules/inventory/inventory.module';

import { CartController } from 'src/modules/cart/controller/cart.controller';
import { CartItemController } from 'src/modules/cart/controller/cart-item.controller';

import { Cart } from 'src/modules/cart/entities/cart.entity';
import { CartItem } from 'src/modules/cart/entities/cart-item.entity';

import { CartItemMapper } from 'src/modules/cart/mapper/cart-item.mapper';

import { CartRepository } from 'src/modules/cart/repositories/cart.repository';
import { CartItemRepository } from 'src/modules/cart/repositories/cart-item.repository';

import { CartServiceImpl } from 'src/modules/cart/service/cart.service.impl';
import { CartItemServiceImpl } from 'src/modules/cart/service/cart-item.service.impl';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      CartItem,
    ]),
    UsersModule,
    ProductsModule,
    InventoryModule,
  ],
  controllers: [
    CartController,
    CartItemController,
  ],
  providers: [
    CartRepository,
    CartItemRepository,
    CartItemMapper,

    CartServiceImpl,
    {
      provide: PROVIDER_TOKEN.CART_SERVICE,
      useExisting: CartServiceImpl,
    },

    CartItemServiceImpl,
    {
      provide: PROVIDER_TOKEN.CART_ITEM_SERVICE,
      useExisting: CartItemServiceImpl,
    },
  ],
  exports: [
    CartRepository,
    CartItemRepository,
    CartItemMapper,

    CartServiceImpl,
    {
      provide: PROVIDER_TOKEN.CART_SERVICE,
      useExisting: CartServiceImpl,
    },

    CartItemServiceImpl,
    {
      provide: PROVIDER_TOKEN.CART_ITEM_SERVICE,
      useExisting: CartItemServiceImpl,
    },
  ],
})
export class CartModule {}

