import { SelectQueryBuilder } from 'typeorm';
import { InventoryTransaction } from 'src/modules/inventory/entities/inventory-transaction.entity';

export class InventoryTransactionSpec {
  /**
   * Lấy các giao dịch kho được tạo từ 00:00:00
   * của ngày `from` trở về sau.
   */
  static fromDate(
    queryBuilder: SelectQueryBuilder<InventoryTransaction>,
    alias: string,
    from: Date | null,
  ): SelectQueryBuilder<InventoryTransaction> {
    if (from === null) {
      return queryBuilder;
    }

    const startOfDay = new Date(from);
    startOfDay.setHours(0, 0, 0, 0);

    return queryBuilder.andWhere(
      `${alias}.createdDate >= :fromDate`,
      {
        fromDate: startOfDay,
      },
    );
  }

  /**
   * Lấy các giao dịch kho được tạo đến 23:59:59
   * của ngày `to`.
   */
  static toDate(
    queryBuilder: SelectQueryBuilder<InventoryTransaction>,
    alias: string,
    to: Date | null,
  ): SelectQueryBuilder<InventoryTransaction> {
    if (to === null) {
      return queryBuilder;
    }

    const endOfDay = new Date(to);
    endOfDay.setHours(23, 59, 59, 0);

    return queryBuilder.andWhere(
      `${alias}.createdDate <= :toDate`,
      {
        toDate: endOfDay,
      },
    );
  }
}
