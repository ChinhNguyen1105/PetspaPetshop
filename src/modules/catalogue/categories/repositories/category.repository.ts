import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from 'src/modules/catalogue/categories/entities/category.entity';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>,
  ) {}

  existsByNameAndDeleteFlagFalse(name: string) {
    return this.repository
      .createQueryBuilder('category')
      .where('category.name = :name', { name })
      .andWhere('category.deleteFlag = false')
      .getExists();
  }

  existsByIdAndDeleteFlagFalse(id: number) {
    return this.repository
      .createQueryBuilder('category')
      .where('category.id = :id', { id })
      .andWhere('category.deleteFlag = false')
      .getExists();
  }

  findByDeleteFlagFalse() {
    return this.repository
      .createQueryBuilder('category')
      .where('category.deleteFlag = false')
      .getMany();
  }

  getRepository(): Repository<Category> {
    return this.repository;
  }
}
