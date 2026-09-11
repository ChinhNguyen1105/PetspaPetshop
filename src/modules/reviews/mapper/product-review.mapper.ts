import { Injectable } from '@nestjs/common';

import { ProductReview } from 'src/modules/reviews/entities/product-review.entity';
import { ProductReviewDto } from 'src/modules/reviews/dto/response/product-review.dto';

@Injectable()
export class ProductReviewMapper {
  toDto(productReview: ProductReview): ProductReviewDto {
    const dto = new ProductReviewDto();

    dto.id = productReview.id;
    dto.rating = productReview.rating;
    dto.comment = productReview.comment;
    dto.userName = productReview.user?.name ?? null;
    dto.productId = productReview.product?.id ?? null;
    dto.createdDate = productReview.createdDate;

    return dto;
  }

  toDtoList(productReviews: ProductReview[]): ProductReviewDto[] {
    return productReviews.map((productReview) =>
      this.toDto(productReview),
    );
  }
}
