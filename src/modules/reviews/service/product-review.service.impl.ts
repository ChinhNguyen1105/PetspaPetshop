import { Injectable } from '@nestjs/common';

import { OrderStatus } from 'src/common/constants/order-status.enum';
import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';
import { BadRequestException } from 'src/common/exceptions/bad-request.exception';
import { ForbiddenException } from 'src/common/exceptions/forbidden.exception';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { FilterProcessor } from 'src/common/specification/filter-processor';
import { SpecificationBuilder } from 'src/common/specification/specification-builder';

import { ProductRepository } from 'src/modules/catalogue/products/repositories/product.repository';
import { OrderDetailRepository } from 'src/modules/orders/repositories/order-detail.repository';
import { ReqCreateProductReviewDto } from 'src/modules/reviews/dto/request/req-create-product-review.dto';
import { ReqUpdateProductReviewDto } from 'src/modules/reviews/dto/request/req-update-product-review.dto';
import { ProductReviewResponseDto } from 'src/modules/reviews/dto/response/product-review-response.dto';
import { ProductReviewDto } from 'src/modules/reviews/dto/response/product-review.dto';
import { ProductReview } from 'src/modules/reviews/entities/product-review.entity';
import { ProductReviewMapper } from 'src/modules/reviews/mapper/product-review.mapper';
import { ProductReviewRepository } from 'src/modules/reviews/repositories/product-review.repository';
import { ProductReviewService } from 'src/modules/reviews/service/product-review.service';
import type { UserService } from 'src/modules/users/service/user.service';

@Injectable()
export class ProductReviewServiceImpl
  implements ProductReviewService
{
  constructor(
    private readonly productReviewRepository: ProductReviewRepository,
    private readonly userService: UserService,
    private readonly productRepository: ProductRepository,
    private readonly orderDetailRepository: OrderDetailRepository,
    private readonly productReviewMapper: ProductReviewMapper,
  ) {}

  async createReview(
    req: ReqCreateProductReviewDto,
  ): Promise<ProductReviewDto> {
    const currentUser =
      await this.userService.getUserLogin();

    const product =
      await this.productRepository
        .getRepository()
        .findOne({
          where: {
            id: req.productId,
          },
        });

    if (!product) {
      throw new NotFoundException(
        `Product with ID: ${req.productId} not found`,
      );
    }

    const hasPurchased =
      await this.orderDetailRepository
        .existsByProductIdAndOrderUserIdAndOrderStatus(
          req.productId,
          currentUser.id,
          OrderStatus.DELIVERED,
        );

    if (!hasPurchased) {
      throw new BadRequestException(
        'You need to purchase and receive the product first to review it',
      );
    }

    const alreadyReviewed =
      await this.productReviewRepository
        .existsByUserIdAndProductIdAndDeleteFlagFalse(
          currentUser.id,
          req.productId,
        );

    if (alreadyReviewed) {
      throw new BadRequestException(
        'You have already reviewed this product before',
      );
    }

    const review = new ProductReview();

    review.user = currentUser;
    review.product = product;
    review.rating = req.rating;
    review.comment = req.comment;

    const saved =
      await this.productReviewRepository
        .getRepository()
        .save(review);

    const newTotalReviews =
      product.totalReviews + 1;

    const newAvgRating =
      (
        product.avgRating * product.totalReviews +
        req.rating
      ) / newTotalReviews;

    product.totalReviews = newTotalReviews;
    product.avgRating =
      Math.round(newAvgRating * 10) / 10;

    await this.productRepository
      .getRepository()
      .save(product);

    return this.productReviewMapper.toDto(saved);
  }

  async updateReview(
    req: ReqUpdateProductReviewDto,
  ): Promise<ProductReviewDto> {
    const review =
      await this.productReviewRepository
        .getRepository()
        .findOne({
          where: {
            id: req.reviewId,
          },
          relations: {
            user: true,
            product: true,
          },
        });

    if (!review) {
      throw new NotFoundException(
        `Review with ID: ${req.reviewId} not found`,
      );
    }

    if (review.deleteFlag) {
      throw new NotFoundException(
        `Review with ID: ${req.reviewId} not found`,
      );
    }

    const currentUser =
      await this.userService.getUserLogin();

    if (review.user.id !== currentUser.id) {
      throw new ForbiddenException(
        'You do not have permission to update this review',
      );
    }

    const product = review.product;

    const oldRating = review.rating;
    const newRating = req.rating;

    if (oldRating !== newRating) {
      const newAvgRating =
        (
          product.avgRating * product.totalReviews -
          oldRating +
          newRating
        ) / product.totalReviews;

      product.avgRating =
        Math.round(newAvgRating * 10) / 10;

      await this.productRepository
        .getRepository()
        .save(product);
    }

    review.rating = newRating;
    review.comment = req.comment;

    const saved =
      await this.productReviewRepository
        .getRepository()
        .save(review);

    return this.productReviewMapper.toDto(saved);
  }

  async deleteReview(
    reviewId: number,
  ): Promise<{ status: boolean; message: string }> {
    const review =
      await this.productReviewRepository
        .getRepository()
        .findOne({
          where: {
            id: reviewId,
          },
          relations: {
            user: true,
            product: true,
          },
        });

    if (!review) {
      throw new NotFoundException(
        `Review with ID: ${reviewId} not found`,
      );
    }

    if (review.deleteFlag) {
      throw new NotFoundException(
        `Review with ID: ${reviewId} not found`,
      );
    }

    const currentUser =
      await this.userService.getUserLogin();

    const isAdmin =
      currentUser.role?.name === 'ADMIN';

    if (
      !isAdmin &&
      review.user.id !== currentUser.id
    ) {
      throw new ForbiddenException(
        'You do not have permission to delete this review',
      );
    }

    review.deleteFlag = true;

    await this.productReviewRepository
      .getRepository()
      .save(review);

    const product = review.product;

    const newTotalReviews =
      product.totalReviews - 1;

    const newAvgRating =
      newTotalReviews === 0
        ? 0
        : (
            product.avgRating * product.totalReviews -
            review.rating
          ) / newTotalReviews;

    product.totalReviews = newTotalReviews;
    product.avgRating =
      Math.round(newAvgRating * 10) / 10;

    await this.productRepository
      .getRepository()
      .save(product);

    return {
      status: true,
      message: 'Delete review successfully',
    };
  }

  async getReviewsByProduct(
    productId: number,
    page: number,
    pageSize: number,
  ): Promise<ProductReviewResponseDto> {
    const product =
      await this.productRepository
        .getRepository()
        .findOne({
          where: {
            id: productId,
          },
        });

    if (!product) {
      throw new NotFoundException(
        `Product with ID: ${productId} not found`,
      );
    }

    const [
      reviews,
      total,
    ] =
      await this.productReviewRepository
        .findByProductIdAndDeleteFlagFalse(
          productId,
          page,
          pageSize,
        );

    const paginationDto =
      new ResultPaginationDto();

    paginationDto.meta = {
      page,
      pageSize,
      pages: Math.ceil(total / pageSize),
      total,
    };

    paginationDto.result =
      this.productReviewMapper.toDtoList(reviews);

    const response =
      new ProductReviewResponseDto();

    response.avgRating = product.avgRating;
    response.totalReviews = product.totalReviews;
    response.reviews = paginationDto;

    return response;
  }

  async getAllReviews(
    filter: string[],
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto> {
    const specificationBuilder =
      new SpecificationBuilder<ProductReview>();

    FilterProcessor.process(
      specificationBuilder,
      filter,
    );

    const queryBuilder =
      this.productReviewRepository
        .getRepository()
        .createQueryBuilder('review')
        .leftJoinAndSelect(
          'review.user',
          'user',
        )
        .leftJoinAndSelect(
          'review.product',
          'product',
        )
        .where(
          'review.deleteFlag = :deleteFlag',
          {
            deleteFlag: false,
          },
        )
        .orderBy(
          'review.createdDate',
          'DESC',
        );

    specificationBuilder.apply(
      queryBuilder,
      'review',
    );

    const [
      reviews,
      total,
    ] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const result =
      new ResultPaginationDto();

    result.meta = {
      page,
      pageSize,
      pages: Math.ceil(total / pageSize),
      total,
    };

    result.result =
      this.productReviewMapper.toDtoList(
        reviews,
      );

    return result;
  }
}
