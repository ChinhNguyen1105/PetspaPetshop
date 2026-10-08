import { Injectable } from '@nestjs/common';

import { InventoryTransaction } from 'src/modules/inventory/entities/inventory-transaction.entity';
import { InventoryTransactionDto } from 'src/modules/inventory/dto/response/inventory-transaction.dto';

@Injectable()
export class InventoryTransactionMapper {
  toInventoryTransactionDto(
    inventoryTransaction: InventoryTransaction,
  ): InventoryTransactionDto {
    const dto = Object.assign(
      new InventoryTransactionDto(),
      inventoryTransaction,
    );

    dto.currentStock = inventoryTransaction.inventory?.quantity ?? null;
    dto.productName =
      inventoryTransaction.inventory?.product?.name ?? null;
    dto.productId =
      inventoryTransaction.inventory?.product?.id ?? null;

    return dto;
  }

  toListInventoryTransaction(
    inventoryTransactions: InventoryTransaction[],
  ): InventoryTransactionDto[] {
    return inventoryTransactions.map((transaction) =>
      this.toInventoryTransactionDto(transaction),
    );
  }
}
