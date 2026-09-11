import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import { VsResponseUtil } from 'src/common/base/vs-response.util';
import { UrlConstant } from 'src/common/constants/url.constant';

import { ReqCreateServiceReviewDto } from 'src/modules/reviews/dto/request/req-create-service-review.dto';
import type { PetServiceReviewService } from 'src/modules/reviews/service/pet-service-review.service';

@RestApiV1()
@Controller()
export class PetServiceReviewController {
  constructor(
    private readonly reviewService: PetServiceReviewService,
  ) {}

  @Post(
    UrlConstant.PetServiceReviews.CREATE_REVIEW,
  )
  async createReview(
    @Body() req: ReqCreateServiceReviewDto,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.CREATED,
      await this.reviewService.createReview(req),
    );
  }

  @Delete(
    UrlConstant.PetServiceReviews.DELETE_REVIEW.replace(
      '{id}',
      ':id',
    ),
  )
  async deleteReview(
    @Param('id') id: number,
  ) {
    await this.reviewService.deleteReview(id);

    return VsResponseUtil.successWithStatus(
      HttpStatus.NO_CONTENT,
      null,
    );
  }

  @Get(
    UrlConstant.PetServiceReviews.GET_SERVICE_REVIEWS.replace(
      '{serviceId}',
      ':serviceId',
    ),
  )
  async getServiceReviews(
    @Param('serviceId') serviceId: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.reviewService.getServiceReviews(
        Number(serviceId),
        Number(page),
        Number(pageSize),
      ),
    );
  }

  @Get(
    UrlConstant.PetServiceReviews.GET_AVERAGE_RATING.replace(
      '{serviceId}',
      ':serviceId',
    ),
  )
  async getAverageRating(
    @Param('serviceId') serviceId: number,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.reviewService.getAverageRating(
        Number(serviceId),
      ),
    );
  }

  @Get(
    UrlConstant.PetServiceReviews.GET_REVIEW_COUNT.replace(
      '{serviceId}',
      ':serviceId',
    ),
  )
  async getReviewCount(
    @Param('serviceId') serviceId: number,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.reviewService.getReviewCount(
        Number(serviceId),
      ),
    );
  }
}
