export class ServiceReviewDto {
  id: number;

  serviceId: number | null;

  userId: string | null;

  userName: string | null;

  rating: number;

  comment: string | null;

  createdDate: Date;
}
