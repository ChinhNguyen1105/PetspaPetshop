
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

import { CategoriesModule } from 'src/modules/catalogue/categories/categories.module';

import { ProductController } from 'src/modules/catalogue/products/controller/product.controller';
import { ProductImageController } from 'src/modules/catalogue/products/controller/product-image.controller';

import { Product } from 'src/modules/catalogue/products/entities/product.entity';
import { ProductImage } from 'src/modules/catalogue/products/entities/product-image.entity';

import { ProductMapper } from 'src/modules/catalogue/products/mapper/product.mapper';

import { ProductRepository } from 'src/modules/catalogue/products/repositories/product.repository';
import { ProductImageRepository } from 'src/modules/catalogue/products/repositories/product-image.repository';

import { ProductServiceImpl } from 'src/modules/catalogue/products/service/product.service.impl';
import { ProductImageServiceImpl } from 'src/modules/catalogue/products/service/product-image.service.impl';

import { FilesModule } from 'src/modules/files/files.module';
import { InventoryModule } from 'src/modules/inventory/inventory.module';
import { RecommendationModule } from 'src/modules/recommendation/recommendation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductImage,
    ]),

    ConfigModule,

    CategoriesModule,
    FilesModule,
    InventoryModule,
    RecommendationModule,
  ],

  controllers: [
    ProductController,
    ProductImageController,
  ],

  providers: [
    ProductRepository,
    ProductImageRepository,

    ProductMapper,

    ProductServiceImpl,
    {
      provide: PROVIDER_TOKEN.PRODUCT_SERVICE,
      useExisting: ProductServiceImpl,
    },

    ProductImageServiceImpl,
    {
      provide: PROVIDER_TOKEN.PRODUCT_IMAGE_SERVICE,
      useExisting: ProductImageServiceImpl,
    },
  ],

  exports: [
    ProductRepository,
    ProductImageRepository,

    ProductMapper,

    ProductServiceImpl,
    {
      provide: PROVIDER_TOKEN.PRODUCT_SERVICE,
      useExisting: ProductServiceImpl,
    },

    ProductImageServiceImpl,
    {
      provide: PROVIDER_TOKEN.PRODUCT_IMAGE_SERVICE,
      useExisting: ProductImageServiceImpl,
    },
  ],
})
export class ProductsModule {}

