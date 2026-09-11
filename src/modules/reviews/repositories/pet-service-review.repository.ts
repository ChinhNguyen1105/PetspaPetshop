import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PetServiceReview } from 'src/modules/reviews/entities/pet-service-review.entity';

@Injectable()
export class PetServiceReviewRepository {
  constructor(
    @InjectRepository(PetServiceReview)
    private readonly repository: Repository<PetServiceReview>,
  ) {}

  findByPetServiceId(
    serviceId: number,
    page: number,
    pageSize: number,
  ): Promise<[PetServiceReview[], number]>;

  findByPetServiceId(
    serviceId: number,
  ): Promise<PetServiceReview[]>;

  findByPetServiceId(
    serviceId: number,
    page?: number,
    pageSize?: number,
  ): Promise<[PetServiceReview[], number] | PetServiceReview[]> {
    const query = this.repository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.petService', 'service')
      .where('service.id = :serviceId', { serviceId });

    if (page !== undefined && pageSize !== undefined) {
      query
        .skip((page - 1) * pageSize)
        .take(pageSize);

      return query.getManyAndCount();
    }

    return query.getMany();
  }

  findByPetServiceIdAndUserId(
    serviceId: number,
    userId: number,
  ) {
    return this.repository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.petService', 'service')
      .leftJoinAndSelect('review.user', 'user')
      .where('service.id = :serviceId', { serviceId })
      .andWhere('user.id = :userId', { userId })
      .getOne();
  }

  getAverageRating(serviceId: number) {
    return this.repository
      .createQueryBuilder('review')
      .leftJoin('review.petService', 'service')
      .select('AVG(review.rating)', 'averageRating')
      .where('service.id = :serviceId', { serviceId })
      .getRawOne<{ averageRating: string | null }>();
  }

  getReviewCount(serviceId: number) {
    return this.repository
      .createQueryBuilder('review')
      .leftJoin('review.petService', 'service')
      .where('service.id = :serviceId', { serviceId })
      .getCount();
  }

  getRepository(): Repository<PetServiceReview> {
    return this.repository;
  }
}
