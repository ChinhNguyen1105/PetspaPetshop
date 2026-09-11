import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductImage } from 'src/modules/catalogue/products/entities/product-image.entity';

@Injectable()
export class ProductImageRepository {
  constructor(
    @InjectRepository(ProductImage)
    private readonly repository: Repository<ProductImage>,
  ) {}

  findByProductId(productId: number) {
    return this.repository
      .createQueryBuilder('image')
      .leftJoinAndSelect('image.product', 'product')
      .where('product.id = :productId', { productId })
      .getMany();
  }

  existsByProductIdAndIsThumbnailTrue(productId: number) {
    return this.repository
      .createQueryBuilder('image')
      .leftJoin('image.product', 'product')
      .where('product.id = :productId', { productId })
      .andWhere('image.isThumbnail = true')
      .getExists();
  }

  resetMainImageByProductId(productId: number) {
    return this.repository
      .createQueryBuilder()
      .update(ProductImage)
      .set({ isThumbnail: false })
      .where('productId = :productId', { productId })
      .execute();
  }

  getRepository(): Repository<ProductImage> {
    return this.repository;
  }
}
