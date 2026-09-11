import { DateAuditing } from 'src/common/dto/common/date-auditing.dto';

export class ProductDto extends DateAuditing {
  id: number;

  name: string | null;

  description: string | null;

  price: number | null;

  categoryName: string | null;

  categoryId: number | null;

  stockQuantity: number | null;

  avgRating: number | null;

  totalReviews: number | null;
}
