export class ProductReviewDto {
  id: number;

  rating: number;

  comment: string | null;

  userName: string | null;

  avatarUrl: string | null;

  productId: number | null;

  createdDate: Date;
}
