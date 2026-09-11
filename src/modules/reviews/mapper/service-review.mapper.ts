import { Injectable } from '@nestjs/common';

import { PetServiceReview } from 'src/modules/reviews/entities/pet-service-review.entity';
import { ServiceReviewDto } from 'src/modules/reviews/dto/response/service-review.dto';

@Injectable()
export class ServiceReviewMapper {
  toDto(review: PetServiceReview): ServiceReviewDto {
    const dto = new ServiceReviewDto();

    dto.id = review.id;
    dto.serviceId = review.petService?.id ?? null;
    dto.userId = review.user?.id ?? null;
    dto.userName = review.user?.name ?? null;
    dto.rating = review.rating;
    dto.comment = review.comment;

    return dto;
  }

  toDtos(reviews: PetServiceReview[]): ServiceReviewDto[] {
    return reviews.map((review) => this.toDto(review));
  }

  toEntity(dto: ServiceReviewDto): PetServiceReview {
    const review = new PetServiceReview();

    review.id = dto.id;
    review.rating = dto.rating;
    review.comment = dto.comment;

    return review;
  }
}
