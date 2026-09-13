import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import { VsResponseUtil } from 'src/common/base/vs-response.util';
import { UrlConstant } from 'src/common/constants/url.constant';

import { ReqCreateProductReviewDto } from 'src/modules/reviews/dto/request/req-create-product-review.dto';
import { ReqUpdateProductReviewDto } from 'src/modules/reviews/dto/request/req-update-product-review.dto';
import type { ProductReviewService } from 'src/modules/reviews/service/product-review.service';

@RestApiV1()
@Controller()
export class ProductReviewController {
  constructor(
    @Inject(PROVIDER_TOKEN.PRODUCT_REVIEW_SERVICE)
    private readonly productReviewService: ProductReviewService,
  ) {}

  @Get(
    UrlConstant.ProductReview.GET_REVIEWS_BY_PRODUCT.replace(
      '{productId}',
      ':productId',
    ),
  )
  async getReviewsByProduct(
    @Param('productId') productId: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    return VsResponseUtil.success(
      await this.productReviewService.getReviewsByProduct(
        Number(productId),
        Number(page),
        Number(pageSize),
      ),
    );
  }

  @Post(UrlConstant.ProductReview.CREATE_REVIEW)
  async createReview(@Body() req: ReqCreateProductReviewDto) {
    return VsResponseUtil.success(
      await this.productReviewService.createReview(req),
    );
  }

  @Put(UrlConstant.ProductReview.UPDATE_REVIEW)
  async updateReview(@Body() req: ReqUpdateProductReviewDto) {
    return VsResponseUtil.success(
      await this.productReviewService.updateReview(req),
    );
  }

  @Delete(
    UrlConstant.ProductReview.DELETE_REVIEW.replace('{reviewId}', ':reviewId'),
  )
  async deleteReview(@Param('reviewId') reviewId: number) {
    return VsResponseUtil.success(
      await this.productReviewService.deleteReview(Number(reviewId)),
    );
  }

  @Get(UrlConstant.ProductReview.GET_ALL_REVIEWS)
  async getAllReviews(
    @Query('filter') filter: string[] | undefined,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    return VsResponseUtil.success(
      await this.productReviewService.getAllReviews(
        filter ?? [],
        Number(page),
        Number(pageSize),
      ),
    );
  }
}
