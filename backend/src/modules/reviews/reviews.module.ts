
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

import { UsersModule } from 'src/modules/users/users.module';
import { OrdersModule } from 'src/modules/orders/orders.module';

import { ProductReviewController } from 'src/modules/reviews/controller/product-review.controller';
import { PetServiceReviewController } from 'src/modules/reviews/controller/pet-service-review.controller';

import { ProductReview } from 'src/modules/reviews/entities/product-review.entity';
import { PetServiceReview } from 'src/modules/reviews/entities/pet-service-review.entity';

import { ProductReviewMapper } from 'src/modules/reviews/mapper/product-review.mapper';
import { ServiceReviewMapper } from 'src/modules/reviews/mapper/service-review.mapper';

import { ProductReviewRepository } from 'src/modules/reviews/repositories/product-review.repository';
import { PetServiceReviewRepository } from 'src/modules/reviews/repositories/pet-service-review.repository';

import { ProductReviewServiceImpl } from 'src/modules/reviews/service/product-review.service.impl';
import { PetServiceReviewServiceImpl } from 'src/modules/reviews/service/pet-service-review.service.impl';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductReview,
      PetServiceReview,
    ]),
    UsersModule,
    OrdersModule,
  ],

  controllers: [
    ProductReviewController,
    PetServiceReviewController,
  ],

  providers: [
    ProductReviewRepository,
    PetServiceReviewRepository,

    ProductReviewMapper,
    ServiceReviewMapper,

    ProductReviewServiceImpl,
    {
      provide: PROVIDER_TOKEN.PRODUCT_REVIEW_SERVICE,
      useExisting: ProductReviewServiceImpl,
    },

    PetServiceReviewServiceImpl,
    {
      provide: PROVIDER_TOKEN.PET_SERVICE_REVIEW_SERVICE,
      useExisting: PetServiceReviewServiceImpl,
    },
  ],

  exports: [
    ProductReviewRepository,
    PetServiceReviewRepository,

    ProductReviewMapper,
    ServiceReviewMapper,

    ProductReviewServiceImpl,
    {
      provide: PROVIDER_TOKEN.PRODUCT_REVIEW_SERVICE,
      useExisting: ProductReviewServiceImpl,
    },

    PetServiceReviewServiceImpl,
    {
      provide: PROVIDER_TOKEN.PET_SERVICE_REVIEW_SERVICE,
      useExisting: PetServiceReviewServiceImpl,
    },
  ],
})
export class ReviewsModule {}

