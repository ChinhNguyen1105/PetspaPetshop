import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { CartController, OrderController } from './commerce.controller';
import { CommerceService } from './commerce.service';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CatalogueModule } from '../catalogue/catalogue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      CartItem,
      Order,
      OrderItem,
      OrderStatusHistory,
    ]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
    CatalogueModule,
  ],
  controllers: [CartController, OrderController],
  providers: [CommerceService, JwtAuthGuard],
  exports: [CommerceService],
})
export class CommerceModule {}
