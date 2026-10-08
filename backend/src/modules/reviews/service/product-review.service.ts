import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';
import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';
import { ReqCreateProductReviewDto } from 'src/modules/reviews/dto/request/req-create-product-review.dto';
import { ReqUpdateProductReviewDto } from 'src/modules/reviews/dto/request/req-update-product-review.dto';
import { ProductReviewDto } from 'src/modules/reviews/dto/response/product-review.dto';
import { ProductReviewResponseDto } from 'src/modules/reviews/dto/response/product-review-response.dto';

export interface ProductReviewService {
  createReview(req: ReqCreateProductReviewDto): Promise<ProductReviewDto>;

  updateReview(req: ReqUpdateProductReviewDto): Promise<ProductReviewDto>;

  deleteReview(reviewId: number): Promise<CommonResponseDto>;

  getReviewsByProduct(
    productId: number,
    page: number,
    pageSize: number,
  ): Promise<ProductReviewResponseDto>;

  getAllReviews(
    filter: string[],
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto>;
}
