import { ServiceImageDto } from 'src/modules/catalogue/services/dto/response/service-image.dto';

export class ServiceDto {
  id: number;

  name: string | null;

  description: string | null;

  basePrice: number | null;

  durationMin: number;

  categoryId: number | null;

  categoryName: string | null;

  serviceImages: ServiceImageDto[];

  averageRating: number | null;

  totalReviews: number | null;

  createdDate: Date;

  lastModifiedDate: Date;
}
