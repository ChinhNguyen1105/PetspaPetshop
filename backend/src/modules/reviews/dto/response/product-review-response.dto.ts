import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';

export class ProductReviewResponseDto {
  avgRating: number;
  totalReviews: number;
  reviews: ResultPaginationDto;
}
