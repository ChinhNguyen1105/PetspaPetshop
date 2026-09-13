import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

// Guards
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/modules/auth/guards/permissions.guard';

// Modules
import { AuthModule } from 'src/modules/auth/auth.module';
import { PermissionModule } from 'src/modules/permissions/permission.module';
import { RoleModule } from 'src/modules/roles/role.module';
import { FilesModule } from 'src/modules/files/files.module';
import { UsersModule } from 'src/modules/users/users.module';

import { MenuModule } from 'src/modules/menu/menu.module';

import { CategoriesModule } from 'src/modules/catalogue/categories/categories.module';
import { ProductsModule } from 'src/modules/catalogue/products/products.module';
import { ServicesModule } from 'src/modules/catalogue/services/services.module';

import { InventoryModule } from 'src/modules/inventory/inventory.module';
import { RecommendationModule } from 'src/modules/recommendation/recommendation.module';

import { PetsModule } from 'src/modules/pets/pets.module';
import { CartModule } from 'src/modules/cart/cart.module';

import { ShippingModule } from 'src/modules/shipping/shipping.module';
import { PaymentsModule } from 'src/modules/payments/payments.module';
import { OrdersModule } from 'src/modules/orders/orders.module';
import { BookingsModule } from 'src/modules/bookings/bookings.module';

import { ReviewsModule } from 'src/modules/reviews/reviews.module';

@Module({
  imports: [
    // 1. Cấu hình biến môi trường toàn cục (.env)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Kết nối Database (MySQL)
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'petspa3',

      // Tự động quét Entity trong toàn bộ project
      entities: [__dirname + '/**/*.entity{.ts,.js}'],

      autoLoadEntities: true,

      // Development hiện tại
      synchronize: true,
    }),

    // 3. Infrastructure / security
    PermissionModule,
    RoleModule,
    FilesModule,
    UsersModule,
    AuthModule,

    // 4. Independent modules
    MenuModule,
    RecommendationModule,

    // 5. Catalogue
    CategoriesModule,
    ProductsModule,
    ServicesModule,

    // 6. Inventory
    InventoryModule,

    // 7. Customer / business modules
    PetsModule,
    CartModule,
    ShippingModule,

    // 8. Orders / payments / bookings
    PaymentsModule,
    OrdersModule,
    BookingsModule,

    // 9. Reviews
    ReviewsModule,
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
