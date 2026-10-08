import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InventoryTransaction } from 'src/modules/inventory/entities/inventory-transaction.entity';

@Injectable()
export class InventoryTransactionRepository {
  constructor(
    @InjectRepository(InventoryTransaction)
    private readonly repository: Repository<InventoryTransaction>,
  ) {}

  findByInventoryId(inventoryId: number) {
    return this.repository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.inventory', 'inventory')
      .where('inventory.id = :inventoryId', { inventoryId })
      .getOne();
  }

  findByInventoryIdOrderByCreatedDateDesc(inventoryId: number) {
    return this.repository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.inventory', 'inventory')
      .where('inventory.id = :inventoryId', { inventoryId })
      .orderBy('transaction.createdDate', 'DESC')
      .getMany();
  }

  getRepository(): Repository<InventoryTransaction> {
    return this.repository;
  }
}
