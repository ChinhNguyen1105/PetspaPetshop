import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductReview } from 'src/modules/reviews/entities/product-review.entity';

@Injectable()
export class ProductReviewRepository {
  constructor(
    @InjectRepository(ProductReview)
    private readonly repository: Repository<ProductReview>,
  ) {}

  existsByUserIdAndProductIdAndDeleteFlagFalse(
    userId: string,
    productId: number,
  ) {
    return this.repository
      .createQueryBuilder('review')
      .leftJoin('review.user', 'user')
      .leftJoin('review.product', 'product')
      .where('user.id = :userId', { userId })
      .andWhere('product.id = :productId', { productId })
      .andWhere('review.deleteFlag = false')
      .getExists();
  }

  findByProductIdAndDeleteFlagFalse(
    productId: number,
    page: number,
    pageSize: number,
  ) {
    return this.repository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product')
      .where('product.id = :productId', { productId })
      .andWhere('review.deleteFlag = false')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
  }

  getRepository(): Repository<ProductReview> {
    return this.repository;
  }
}
