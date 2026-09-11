import {
  IsDefined,
  IsInt,
  Max,
  Min,
} from 'class-validator';

export class ReqCreateServiceReviewDto {
  @IsDefined({ message: 'Service ID is required' })
  serviceId: number;

  @IsDefined({ message: 'Rating is required' })
  @IsInt()
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  rating: number;

  comment: string | null;
}
