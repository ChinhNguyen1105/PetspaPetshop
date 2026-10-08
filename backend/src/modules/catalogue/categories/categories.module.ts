
import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryController } from 'src/modules/catalogue/categories/category.controller';

import { Category } from 'src/modules/catalogue/categories/entities/category.entity';

import { CategoryMapper } from 'src/modules/catalogue/categories/mapper/category.mapper';

import { CategoryRepository } from 'src/modules/catalogue/categories/repositories/category.repository';

import { CategoryServiceImpl } from 'src/modules/catalogue/categories/service/category.service.impl';

import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
  ],

  controllers: [
    CategoryController,
  ],

  providers: [
    CategoryRepository,
    CategoryMapper,
    CategoryServiceImpl,
    {
      provide: PROVIDER_TOKEN.CATEGORY_SERVICE,
      useExisting: CategoryServiceImpl,
    },
  ],

  exports: [
    CategoryRepository,
    CategoryMapper,
    CategoryServiceImpl,
    {
      provide: PROVIDER_TOKEN.CATEGORY_SERVICE,
      useExisting: CategoryServiceImpl,
    },
  ],
})
export class CategoriesModule {}

