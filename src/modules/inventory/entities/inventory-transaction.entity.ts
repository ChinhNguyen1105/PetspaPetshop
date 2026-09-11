import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserDateAuditing } from '../../../common/entities/user-date-auditing.entity';
import { TypeInventory } from '../../../common/constants/type-inventory.enum';

import { Inventory } from './inventory.entity';

@Entity('tbl_inventories_transactions')
export class InventoryTransaction extends UserDateAuditing {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
  })
  id: number;

  @Column({
    name: 'quantity',
    nullable: true,
  })
  quantity: number | null;

  @Column({
    name: 'type',
    type: 'enum',
    enum: TypeInventory,
    nullable: true,
  })
  type: TypeInventory | null;

  @Column({
    name: 'note',
    nullable: true,
  })
  note: string | null;

  @ManyToOne(
    () => Inventory,
    (inventory) => inventory.inventoryTransactions,
  )
  @JoinColumn({
    name: 'inventory_id',
  })
  inventory: Inventory;
}
