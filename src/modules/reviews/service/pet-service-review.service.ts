import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';
import { ReqCreateServiceReviewDto } from 'src/modules/reviews/dto/request/req-create-service-review.dto';
import { ServiceReviewDto } from 'src/modules/reviews/dto/response/service-review.dto';

export interface PetServiceReviewService {
  createReview(
    req: ReqCreateServiceReviewDto,
  ): Promise<ServiceReviewDto>;

  deleteReview(reviewId: number): Promise<void>;

  getServiceReviews(
    serviceId: number,
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto>;

  getAverageRating(serviceId: number): Promise<number>;

  getReviewCount(serviceId: number): Promise<number>;
}
