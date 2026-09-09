import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CategoryController,
  ProductController,
  ServiceController,
} from './catalogue.controller';
import { CatalogueService } from './catalogue.service';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { Service } from './entities/service.entity';
import { ProductImage } from './entities/product-image.entity';
import { ServiceImage } from './entities/service-image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      Product,
      Service,
      ProductImage,
      ServiceImage,
    ]),
  ],
  controllers: [CategoryController, ProductController, ServiceController],
  providers: [CatalogueService],
  exports: [CatalogueService],
})
export class CatalogueModule {}
