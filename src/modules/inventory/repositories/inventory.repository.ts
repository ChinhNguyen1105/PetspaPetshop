import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Inventory } from 'src/modules/inventory/entities/inventory.entity';

@Injectable()
export class InventoryRepository {
  constructor(
    @InjectRepository(Inventory)
    private readonly repository: Repository<Inventory>,
  ) {}

  findByProductId(productId: number) {
    return this.repository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .where('product.id = :productId', { productId })
      .getOne();
  }

  getRepository(): Repository<Inventory> {
    return this.repository;
  }
}
