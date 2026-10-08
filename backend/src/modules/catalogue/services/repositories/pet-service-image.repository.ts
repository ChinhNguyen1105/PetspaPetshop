import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PetServiceImage } from 'src/modules/catalogue/services/entities/pet-service-image.entity';

@Injectable()
export class PetServiceImageRepository {
  constructor(
    @InjectRepository(PetServiceImage)
    private readonly repository: Repository<PetServiceImage>,
  ) {}

  findByPetServiceId(serviceId: number) {
    return this.repository
      .createQueryBuilder('image')
      .leftJoinAndSelect('image.petService', 'service')
      .where('service.id = :serviceId', { serviceId })
      .getMany();
  }

  findByPetServiceIdAndIsThumbnailTrue(serviceId: number) {
    return this.repository
      .createQueryBuilder('image')
      .leftJoinAndSelect('image.petService', 'service')
      .where('service.id = :serviceId', { serviceId })
      .andWhere('image.isThumbnail = true')
      .getOne();
  }

  getRepository(): Repository<PetServiceImage> {
    return this.repository;
  }
}
