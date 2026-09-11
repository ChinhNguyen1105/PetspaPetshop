import { UserDateAuditingDto } from 'src/common/dto/common/user-date-auditing.dto';
import { TypeInventory } from 'src/common/constants/type-inventory.enum';

export class InventoryTransactionDto extends UserDateAuditingDto {
  quantity: number | null;

  type: TypeInventory | null;

  note: string | null;

  currentStock: number | null;

  productName: string | null;

  productId: number | null;
}
