import {
  IsDefined,
  IsInt,
  Max,
  Min,
} from 'class-validator';

export class ReqCreateProductReviewDto {
  @IsDefined({ message: 'Product Id must not be null' })
  productId: number;

  @IsDefined({ message: 'Rating must not be null' })
  @IsInt()
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  rating: number;

  comment: string | null;
}
