import {
  IsDefined,
  IsNotEmpty,
} from 'class-validator';

import { TypeInventory } from 'src/common/constants/type-inventory.enum';

export class ReqInventoryTransactionDto {
  @IsDefined({ message: 'Product ID is required' })
  productId: number;

  @IsNotEmpty({ message: 'Type is required' })
  type: TypeInventory;

  fromDate: Date | null;

  toDate: Date | null;
}
