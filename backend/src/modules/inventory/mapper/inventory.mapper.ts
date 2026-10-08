import { Injectable } from '@nestjs/common';

import { Inventory } from 'src/modules/inventory/entities/inventory.entity';
import { InventoryDto } from 'src/modules/inventory/dto/response/inventory.dto';

@Injectable()
export class InventoryMapper {
  toDto(inventory: Inventory): InventoryDto {
    const dto = new InventoryDto();

    dto.id = inventory.id;
    dto.quantity = inventory.quantity;

    dto.productId = inventory.product?.id ?? null;
    dto.productName = inventory.product?.name ?? null;
    dto.productPrice = inventory.product?.price ?? null;

    return dto;
  }

  toListInventory(inventoryList: Inventory[]): InventoryDto[] {
    return inventoryList.map((inventory) => this.toDto(inventory));
  }
}
