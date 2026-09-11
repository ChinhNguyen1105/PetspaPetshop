import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PetService } from 'src/modules/catalogue/services/entities/pet-service.entity';

@Injectable()
export class PetServiceRepository {
  constructor(
    @InjectRepository(PetService)
    private readonly repository: Repository<PetService>,
  ) {}

  findByDeleteFlagFalseAndActiveFlagTrue(page: number, pageSize: number) {
    return this.repository
      .createQueryBuilder('service')
      .where('service.deleteFlag = false')
      .andWhere('service.activeFlag = true')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
  }

  findByDeleteFlagFalseAndActiveFlagTrueAndNameContainingIgnoreCase(
    name: string,
    page: number,
    pageSize: number,
  ) {
    return this.repository
      .createQueryBuilder('service')
      .where('service.deleteFlag = false')
      .andWhere('service.activeFlag = true')
      .andWhere('LOWER(service.name) LIKE LOWER(:name)', {
        name: `%${name}%`,
      })
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
  }

  findByDeleteFlagFalseAndActiveFlagTrueAndCategoryId(
    categoryId: number,
    page: number,
    pageSize: number,
  ) {
    return this.repository
      .createQueryBuilder('service')
      .leftJoin('service.category', 'category')
      .where('service.deleteFlag = false')
      .andWhere('service.activeFlag = true')
      .andWhere('category.id = :categoryId', { categoryId })
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
  }

  findAllByDeleteFlagFalseAndActiveFlagTrueAndCategoryId(
    categoryId: number,
  ) {
    return this.repository
      .createQueryBuilder('service')
      .leftJoin('service.category', 'category')
      .where('service.deleteFlag = false')
      .andWhere('service.activeFlag = true')
      .andWhere('category.id = :categoryId', { categoryId })
      .getMany();
  }

  findByIdAndDeleteFlagFalseAndActiveFlagTrue(id: number) {
    return this.repository
      .createQueryBuilder('service')
      .where('service.id = :id', { id })
      .andWhere('service.deleteFlag = false')
      .andWhere('service.activeFlag = true')
      .getOne();
  }

  getRepository(): Repository<PetService> {
    return this.repository;
  }
}
