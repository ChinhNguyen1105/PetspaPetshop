import { Injectable, Logger } from '@nestjs/common';

import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';
import { BadRequestException } from 'src/common/exceptions/bad-request.exception';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';

import { PetServiceRepository } from 'src/modules/catalogue/services/repositories/pet-service.repository';
import { ReqCreateServiceReviewDto } from 'src/modules/reviews/dto/request/req-create-service-review.dto';
import { ServiceReviewDto } from 'src/modules/reviews/dto/response/service-review.dto';
import { PetServiceReview } from 'src/modules/reviews/entities/pet-service-review.entity';
import { ServiceReviewMapper } from 'src/modules/reviews/mapper/service-review.mapper';
import { PetServiceReviewRepository } from 'src/modules/reviews/repositories/pet-service-review.repository';
import { PetServiceReviewService } from 'src/modules/reviews/service/pet-service-review.service';
import type { UserService } from 'src/modules/users/service/user.service';

@Injectable()
export class PetServiceReviewServiceImpl
  implements PetServiceReviewService
{
  private readonly logger = new Logger(
    PetServiceReviewServiceImpl.name,
  );

  constructor(
    private readonly reviewRepository: PetServiceReviewRepository,
    private readonly serviceRepository: PetServiceRepository,
    private readonly userService: UserService,
    private readonly reviewMapper: ServiceReviewMapper,
  ) {}

  async createReview(
    req: ReqCreateServiceReviewDto,
  ): Promise<ServiceReviewDto> {
    this.logger.log(
      `[SERVICE_REVIEW] Creating review for service: ${req.serviceId}`,
    );

    if (req.rating < 1 || req.rating > 5) {
      throw new BadRequestException(
        '[SERVICE_REVIEW] Rating must be between 1 and 5',
      );
    }

    const currentUser = await this.userService.getUserLogin();

    const service = await this.serviceRepository
      .getRepository()
      .findOne({
        where: {
          id: req.serviceId,
        },
      });

    if (!service) {
      throw new NotFoundException(
        '[SERVICE_REVIEW] Service not found',
      );
    }

    const existingReview =
      await this.reviewRepository.findByPetServiceIdAndUserId(
        req.serviceId,
        Number(currentUser.id),
      );

    if (existingReview) {
      throw new BadRequestException(
        '[SERVICE_REVIEW] User already reviewed this service',
      );
    }

    const review = new PetServiceReview();

    review.petService = service;
    review.user = currentUser;
    review.rating = req.rating;
    review.comment = req.comment;

    const savedReview =
      await this.reviewRepository.getRepository().save(review);

    this.logger.log(
      `[SERVICE_REVIEW] Review created successfully with ID: ${savedReview.id}`,
    );

    return this.reviewMapper.toDto(savedReview);
  }

  async deleteReview(reviewId: number): Promise<void> {
    this.logger.log(
      `[SERVICE_REVIEW] Deleting review with ID: ${reviewId}`,
    );

    const review = await this.reviewRepository
      .getRepository()
      .findOne({
        where: {
          id: reviewId,
        },
        relations: {
          user: true,
        },
      });

    if (!review) {
      throw new NotFoundException(
        '[SERVICE_REVIEW] Review not found',
      );
    }

    const currentUser = await this.userService.getUserLogin();

    if (Number(review.user.id) !== Number(currentUser.id)) {
      throw new BadRequestException(
        '[SERVICE_REVIEW] You can only delete your own reviews',
      );
    }

    await this.reviewRepository.getRepository().remove(review);

    this.logger.log(
      '[SERVICE_REVIEW] Review deleted successfully',
    );
  }

  async getServiceReviews(
    serviceId: number,
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto> {
    this.logger.log(
      `[SERVICE_REVIEW] Getting reviews for service: ${serviceId}`,
    );

    const service = await this.serviceRepository
      .getRepository()
      .findOne({
        where: {
          id: serviceId,
        },
      });

    if (!service) {
      throw new NotFoundException(
        '[SERVICE_REVIEW] Service not found',
      );
    }

    const [reviews, total] =
      await this.reviewRepository.findByPetServiceId(
        serviceId,
        page,
        pageSize,
      );

    const dtos = this.reviewMapper.toDtos(reviews);

    return {
      result: dtos,
      meta: {
        page,
        pageSize,
        pages: Math.ceil(total / pageSize),
        total,
      },
    };
  }

  async getAverageRating(serviceId: number): Promise<number> {
    const result =
      await this.reviewRepository.getAverageRating(serviceId);

    if (!result?.averageRating) {
      return 0;
    }

    return Number(result.averageRating);
  }

  async getReviewCount(serviceId: number): Promise<number> {
    return this.reviewRepository.getReviewCount(serviceId);
  }
}
