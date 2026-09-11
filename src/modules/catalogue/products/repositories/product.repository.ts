import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from 'src/modules/catalogue/products/entities/product.entity';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {}

  existsByNameAndDeleteFlagFalse(name: string) {
    return this.repository
      .createQueryBuilder('product')
      .where('product.name = :name', { name })
      .andWhere('product.deleteFlag = false')
      .getExists();
  }

  findByIdAndDeleteFlagFalse(id: number) {
    return this.repository
      .createQueryBuilder('product')
      .where('product.id = :id', { id })
      .andWhere('product.deleteFlag = false')
      .getOne();
  }

  getRepository(): Repository<Product> {
    return this.repository;
  }
}
