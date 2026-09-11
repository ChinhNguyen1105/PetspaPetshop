import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';
import { ReqAdjustProductDto } from 'src/modules/inventory/dto/request/req-adjust-product.dto';
import { ReqInventoryProductDto } from 'src/modules/inventory/dto/request/req-inventory-product.dto';
import { InventoryDto } from 'src/modules/inventory/dto/response/inventory.dto';
import { InventoryTransactionDto } from 'src/modules/inventory/dto/response/inventory-transaction.dto';

export interface InventoryService {
  importProduct(
    reqInventoryProduct: ReqInventoryProductDto,
  ): Promise<InventoryTransactionDto>;

  exportProduct(
    reqInventoryProduct: ReqInventoryProductDto,
  ): Promise<InventoryTransactionDto>;

  adjustProduct(
    reqAdjustProduct: ReqAdjustProductDto,
  ): Promise<InventoryTransactionDto>;

  getInventoryByProductId(
    productId: number,
  ): Promise<InventoryDto>;

  getInventoryTransactionHistory(
    filter: string[],
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto>;
}
