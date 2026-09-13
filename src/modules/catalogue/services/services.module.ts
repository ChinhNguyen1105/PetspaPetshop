
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

import { CategoriesModule } from 'src/modules/catalogue/categories/categories.module';
import { RecommendationModule } from 'src/modules/recommendation/recommendation.module';
import { ReviewsModule } from 'src/modules/reviews/reviews.module';

import { PetServiceController } from 'src/modules/catalogue/services/controller/pet-service.controller';
import { PetServiceImageController } from 'src/modules/catalogue/services/controller/pet-service-image.controller';

import { PetService } from 'src/modules/catalogue/services/entities/pet-service.entity';
import { PetServiceImage } from 'src/modules/catalogue/services/entities/pet-service-image.entity';

import { ServiceImageMapper } from 'src/modules/catalogue/services/mapper/service-image.mapper';
import { ServiceMapper } from 'src/modules/catalogue/services/mapper/service.mapper';

import { ServiceRepository } from 'src/modules/catalogue/services/repositories/service.repository';
import { PetServiceImageRepository } from 'src/modules/catalogue/services/repositories/pet-service-image.repository';
import { PetServiceRepository } from 'src/modules/catalogue/services/repositories/pet-service.repository';

import { PetServiceImageServiceImpl } from 'src/modules/catalogue/services/service/pet-service-image.service.impl';
import { PetServiceServiceImpl } from 'src/modules/catalogue/services/service/pet-service.service.impl';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PetService,
      PetServiceImage,
    ]),
    CategoriesModule,
    RecommendationModule,
    ReviewsModule,
  ],

  controllers: [
    PetServiceController,
    PetServiceImageController,
  ],

  providers: [
    ServiceRepository,
    PetServiceRepository,
    PetServiceImageRepository,

    ServiceImageMapper,
    ServiceMapper,

    PetServiceServiceImpl,
    {
      provide: PROVIDER_TOKEN.PET_SERVICE_SERVICE,
      useExisting: PetServiceServiceImpl,
    },

    PetServiceImageServiceImpl,
    {
      provide: PROVIDER_TOKEN.PET_SERVICE_IMAGE_SERVICE,
      useExisting: PetServiceImageServiceImpl,
    },
  ],

  exports: [
    ServiceRepository,
    PetServiceRepository,
    PetServiceImageRepository,

    ServiceImageMapper,
    ServiceMapper,

    PetServiceServiceImpl,
    {
      provide: PROVIDER_TOKEN.PET_SERVICE_SERVICE,
      useExisting: PetServiceServiceImpl,
    },

    PetServiceImageServiceImpl,
    {
      provide: PROVIDER_TOKEN.PET_SERVICE_IMAGE_SERVICE,
      useExisting: PetServiceImageServiceImpl,
    },
  ],
})
export class ServicesModule {}

