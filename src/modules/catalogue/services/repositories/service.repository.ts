import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PetService } from 'src/modules/catalogue/services/entities/pet-service.entity';

@Injectable()
export class ServiceRepository {
  constructor(
    @InjectRepository(PetService)
    private readonly repository: Repository<PetService>,
  ) {}

  existsByNameAndDeleteFlagFalse(name: string) {
    return this.repository
      .createQueryBuilder('service')
      .where('service.name = :name', { name })
      .andWhere('service.deleteFlag = false')
      .getExists();
  }

  getRepository(): Repository<PetService> {
    return this.repository;
  }
}
