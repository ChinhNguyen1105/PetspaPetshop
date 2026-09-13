
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

import { InventoryController } from 'src/modules/inventory/controller/inventory.controller';

import { Inventory } from 'src/modules/inventory/entities/inventory.entity';
import { InventoryTransaction } from 'src/modules/inventory/entities/inventory-transaction.entity';

import { InventoryMapper } from 'src/modules/inventory/mapper/inventory.mapper';
import { InventoryTransactionMapper } from 'src/modules/inventory/mapper/inventory-transaction.mapper';

import { InventoryRepository } from 'src/modules/inventory/repositories/inventory.repository';
import { InventoryTransactionRepository } from 'src/modules/inventory/repositories/inventory-transaction.repository';

import { InventoryServiceImpl } from 'src/modules/inventory/service/inventory.service.impl';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inventory,
      InventoryTransaction,
    ]),
  ],

  controllers: [
    InventoryController,
  ],

  providers: [
    InventoryRepository,
    InventoryTransactionRepository,

    InventoryMapper,
    InventoryTransactionMapper,

    InventoryServiceImpl,
    {
      provide: PROVIDER_TOKEN.INVENTORY_SERVICE,
      useExisting: InventoryServiceImpl,
    },
  ],

  exports: [
    InventoryRepository,
    InventoryTransactionRepository,

    InventoryMapper,
    InventoryTransactionMapper,

    InventoryServiceImpl,
    {
      provide: PROVIDER_TOKEN.INVENTORY_SERVICE,
      useExisting: InventoryServiceImpl,
    },
  ],
})
export class InventoryModule {}

