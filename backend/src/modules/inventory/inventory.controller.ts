import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { VsResponseUtil } from 'src/common/base/vs-response.util';
import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';
import { UrlConstant } from 'src/common/constants/url.constant';
import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import { PaginationDto } from 'src/common/dto/pagination/pagination.dto';

import { ReqAdjustProductDto } from 'src/modules/inventory/dto/request/req-adjust-product.dto';
import { ReqInventoryProductDto } from 'src/modules/inventory/dto/request/req-inventory-product.dto';

import type { InventoryService } from 'src/modules/inventory/service/inventory.service';

@RestApiV1()
@Controller()
export class InventoryController {
  constructor(
    @Inject(PROVIDER_TOKEN.INVENTORY_SERVICE)
    private readonly inventoryService: InventoryService,
  ) {}

  @Get(UrlConstant.Inventory.GET_INVENTORY_LIST)
  async getInventoryList(
    @Query('filter') filter: string[] | undefined,
    @Query() pagination: PaginationDto,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.inventoryService.getInventoryList(
        filter ?? [],
        pagination.page,
        pagination.pageSize,
      ),
    );
  }

  @Get(UrlConstant.Inventory.GET_INVENTORY_TRANSACTION_HISTORY)
  async getInventoryTransactionHistory(
    @Query('filter') filter: string[] | undefined,
    @Query() pagination: PaginationDto,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.inventoryService.getInventoryTransactionHistory(
        filter ?? [],
        pagination.page,
        pagination.pageSize,
      ),
    );
  }

  @Get(
    UrlConstant.Inventory.GET_INVENTORY_BY_PRODUCT_ID.replace(
      '{id}',
      ':id',
    ),
  )
  async getInventoryByProductId(
    @Param('id') id: number,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.inventoryService.getInventoryByProductId(id),
    );
  }

  @Post(UrlConstant.Inventory.IMPORT_PRODUCT)
  async importInventory(
    @Body() reqInventoryProduct: ReqInventoryProductDto,
  ) {
    const importInventory =
      await this.inventoryService.importProduct(
        reqInventoryProduct,
      );

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      importInventory,
    );
  }

  @Post(UrlConstant.Inventory.EXPORT_PRODUCT)
  async exportInventory(
    @Body() reqInventoryProduct: ReqInventoryProductDto,
  ) {
    const exportInventory =
      await this.inventoryService.exportProduct(
        reqInventoryProduct,
      );

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      exportInventory,
    );
  }

  @Post(UrlConstant.Inventory.ADJUST_PRODUCT)
  async adjustInventory(
    @Body() reqAdjustProduct: ReqAdjustProductDto,
  ) {
    const adjustInventory =
      await this.inventoryService.adjustProduct(
        reqAdjustProduct,
      );

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      adjustInventory,
    );
  }
}
