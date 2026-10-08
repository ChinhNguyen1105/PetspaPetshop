import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserDateAuditing } from '../../../common/entities/user-date-auditing.entity';

import { Product } from '../../catalogue/products/entities/product.entity';
import { InventoryTransaction } from './inventory-transaction.entity';

@Entity('tbl_inventories')
export class Inventory extends UserDateAuditing {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
  })
  id: number;

  @Column({
    name: 'quantity',
    type: 'int', // Bắt buộc thêm kiểu dữ liệu int
    nullable: true,
  })
  quantity: number | null;

  @OneToOne(() => Product, (product) => product.inventory)
  @JoinColumn({
    name: 'product_id',
  })
  product: Product;

  @OneToMany(
    () => InventoryTransaction,
    (inventoryTransaction) => inventoryTransaction.inventory,
  )
  inventoryTransactions: InventoryTransaction[];
}
