import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import { TypeInventory } from 'src/common/constants/type-inventory.enum';
import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';
import { BadRequestException } from 'src/common/exceptions/bad-request.exception';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { FilterProcessor } from 'src/common/specification/filter-processor';
import { SpecificationBuilder } from 'src/common/specification/specification-builder';

import { Product } from 'src/modules/catalogue/products/entities/product.entity';

import { ReqAdjustProductDto } from 'src/modules/inventory/dto/request/req-adjust-product.dto';
import { ReqInventoryProductDto } from 'src/modules/inventory/dto/request/req-inventory-product.dto';
import { InventoryDto } from 'src/modules/inventory/dto/response/inventory.dto';
import { InventoryTransactionDto } from 'src/modules/inventory/dto/response/inventory-transaction.dto';

import { Inventory } from 'src/modules/inventory/entities/inventory.entity';
import { InventoryTransaction } from 'src/modules/inventory/entities/inventory-transaction.entity';

import { InventoryMapper } from 'src/modules/inventory/mapper/inventory.mapper';
import { InventoryTransactionMapper } from 'src/modules/inventory/mapper/inventory-transaction.mapper';

import { InventoryRepository } from 'src/modules/inventory/repositories/inventory.repository';
import { InventoryTransactionRepository } from 'src/modules/inventory/repositories/inventory-transaction.repository';

import { ProductRepository } from 'src/modules/catalogue/products/repositories/product.repository';

import type { InventoryService } from 'src/modules/inventory/service/inventory.service';

@Injectable()
export class InventoryServiceImpl implements InventoryService {
  private readonly logger = new Logger(
    InventoryServiceImpl.name,
  );

  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly productRepository: ProductRepository,
    private readonly inventoryTransactionRepository: InventoryTransactionRepository,
    private readonly mapper: InventoryTransactionMapper,
    private readonly inventoryMapper: InventoryMapper,
    private readonly dataSource: DataSource,
  ) {}

  async importProduct(
    reqInventoryProduct: ReqInventoryProductDto,
  ): Promise<InventoryTransactionDto> {
    return this.dataSource.transaction(async (manager) => {
      const product = await manager
        .getRepository(Product)
        .findOne({
          where: {
            id: reqInventoryProduct.productId,
          },
        });

      if (!product) {
        throw new NotFoundException(
          `Product not found with id: ${reqInventoryProduct.productId}`,
        );
      }

      const inventory = await this.findInventory(
        manager,
        reqInventoryProduct.productId,
      );

      if (!inventory) {
        throw new NotFoundException(
          `Inventory not found with productId: ${reqInventoryProduct.productId}`,
        );
      }

      if (reqInventoryProduct.quantity <= 0) {
        throw new BadRequestException(
          'Invalid quantity is negative (<= 0)',
        );
      }

      const oldQty = inventory.quantity ?? 0;
      const newQty =
        oldQty + reqInventoryProduct.quantity;

      inventory.quantity = newQty;

      await manager
        .getRepository(Inventory)
        .save(inventory);

      this.logger.log(
        `[IMPORT] Tồn kho thay đổi ${oldQty} → ${newQty}`,
      );

      const inventoryTransaction =
        await this.createInventoryTransaction(
          manager,
          inventory,
          reqInventoryProduct.quantity,
          TypeInventory.IMPORT,
          reqInventoryProduct.note,
        );

      this.logger.log(
        `[IMPORT] Ghi transaction thành công | Product ID: ${reqInventoryProduct.productId} | quantity: ${reqInventoryProduct.quantity}`,
      );

      return this.mapper.toInventoryTransactionDto(
        inventoryTransaction,
      );
    });
  }

  async exportProduct(
    reqInventoryProduct: ReqInventoryProductDto,
  ): Promise<InventoryTransactionDto> {
    return this.dataSource.transaction(async (manager) => {
      const product = await manager
        .getRepository(Product)
        .findOne({
          where: {
            id: reqInventoryProduct.productId,
          },
        });

      if (!product) {
        throw new NotFoundException(
          `Product not found with id: ${reqInventoryProduct.productId}`,
        );
      }

      const inventory = await this.findInventory(
        manager,
        reqInventoryProduct.productId,
      );

      if (!inventory) {
        throw new NotFoundException(
          `Inventory not found with productId: ${reqInventoryProduct.productId}`,
        );
      }

      if (reqInventoryProduct.quantity <= 0) {
        throw new BadRequestException(
          'Invalid quantity is negative (<= 0)',
        );
      }

      const oldQty = inventory.quantity ?? 0;

      if (
        oldQty < reqInventoryProduct.quantity
      ) {
        this.logger.log(
          `[EXPORT] Tồn kho không đủ | Product ID: ${reqInventoryProduct.productId} | quantity: ${reqInventoryProduct.quantity} | current stock: ${oldQty}`,
        );

        throw new BadRequestException(
          'Not enough quantity in stock',
        );
      }

      const newQty =
        oldQty - reqInventoryProduct.quantity;

      inventory.quantity = newQty;

      await manager
        .getRepository(Inventory)
        .save(inventory);

      this.logger.log(
        `[EXPORT] Tồn kho thay đổi ${oldQty} → ${newQty}`,
      );

      const inventoryTransaction =
        await this.createInventoryTransaction(
          manager,
          inventory,
          reqInventoryProduct.quantity,
          TypeInventory.EXPORT,
          reqInventoryProduct.note,
        );

      this.logger.log(
        `[EXPORT] Ghi transaction thành công | Product ID: ${reqInventoryProduct.productId} | quantity: ${reqInventoryProduct.quantity}`,
      );

      return this.mapper.toInventoryTransactionDto(
        inventoryTransaction,
      );
    });
  }

  async adjustProduct(
    reqAdjustProduct: ReqAdjustProductDto,
  ): Promise<InventoryTransactionDto> {
    return this.dataSource.transaction(async (manager) => {
      const product = await manager
        .getRepository(Product)
        .findOne({
          where: {
            id: reqAdjustProduct.productId,
          },
        });

      if (!product) {
        throw new NotFoundException(
          `Product not found with id: ${reqAdjustProduct.productId}`,
        );
      }

      const inventory = await this.findInventory(
        manager,
        reqAdjustProduct.productId,
      );

      if (!inventory) {
        throw new NotFoundException(
          `Inventory not found with productId: ${reqAdjustProduct.productId}`,
        );
      }

      if (reqAdjustProduct.newQuantity < 0) {
        throw new BadRequestException(
          'Invalid quantity is negative (<= 0)',
        );
      }

      const oldQty = inventory.quantity ?? 0;
      const newQty =
        reqAdjustProduct.newQuantity;

      const delta = newQty - oldQty;

      if (delta === 0) {
        this.logger.log(
          `[ADJUST] Số lượng không thay đổi | Product ID: ${reqAdjustProduct.productId} | quantity: ${newQty}`,
        );

        throw new BadRequestException(
          'New quantity is the same as current quantity',
        );
      }

      inventory.quantity = newQty;

      await manager
        .getRepository(Inventory)
        .save(inventory);

      const note =
        `[${delta > 0 ? '+' : ''}${delta}] ${reqAdjustProduct.note}`;

      const inventoryTransaction =
        await this.createInventoryTransaction(
          manager,
          inventory,
          Math.abs(delta),
          TypeInventory.ADJUST,
          note,
        );

      this.logger.log(
        `[ADJUST] Ghi transaction thành công | Product ID: ${reqAdjustProduct.productId} | delta: ${delta}`,
      );

      return this.mapper.toInventoryTransactionDto(
        inventoryTransaction,
      );
    });
  }

  async getInventoryByProductId(
    productId: number,
  ): Promise<InventoryDto> {
    this.logger.log(
      `[INVENTORY] Xem tồn kho cho Product ID: ${productId}`,
    );

    const product =
      await this.productRepository
        .getRepository()
        .findOne({
          where: {
            id: productId,
          },
        });

    if (!product) {
      throw new NotFoundException(
        `Product not found with id: ${productId}`,
      );
    }

    if (
      product.deleteFlag === true ||
      product.activeFlag === false
    ) {
      throw new NotFoundException(
        `Product not found with id: ${productId}`,
      );
    }

    const inventory =
      await this.inventoryRepository.findByProductId(
        productId,
      );

    if (!inventory) {
      throw new NotFoundException(
        `Inventory not found with productId: ${productId}`,
      );
    }

    this.logger.log(
      `[INVENTORY] Product ID: ${productId} | Tồn kho hiện tại: ${inventory.quantity}`,
    );

    return this.inventoryMapper.toDto(inventory);
  }

  async getInventoryTransactionHistory(
    filter: string[],
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto> {
    const specificationBuilder =
      new SpecificationBuilder<InventoryTransaction>();

    FilterProcessor.process(
      specificationBuilder,
      filter,
    );

    const queryBuilder =
      this.inventoryTransactionRepository
        .getRepository()
        .createQueryBuilder('transaction')
        .leftJoinAndSelect(
          'transaction.inventory',
          'inventory',
        )
        .leftJoinAndSelect(
          'inventory.product',
          'product',
        )
        .orderBy(
          'transaction.createdDate',
          'DESC',
        );

    specificationBuilder.apply(
      queryBuilder,
      'transaction',
    );

    queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [transactions, total] =
      await queryBuilder.getManyAndCount();

    const dtoList =
      this.mapper.toListInventoryTransaction(
        transactions,
      );

    return {
      result: dtoList,
      meta: {
        page,
        pageSize,
        pages: Math.ceil(total / pageSize),
        total,
      },
    };
  }

  private async findInventory(
    manager: EntityManager,
    productId: number,
  ): Promise<Inventory | null> {
    return manager
      .getRepository(Inventory)
      .createQueryBuilder('inventory')
      .leftJoinAndSelect(
        'inventory.product',
        'product',
      )
      .where(
        'product.id = :productId',
        { productId },
      )
      .getOne();
  }

  private async createInventoryTransaction(
    manager: EntityManager,
    inventory: Inventory,
    quantity: number,
    type: TypeInventory,
    note: string,
  ): Promise<InventoryTransaction> {
    const inventoryTransaction =
      new InventoryTransaction();

    inventoryTransaction.quantity = quantity;
    inventoryTransaction.type = type;
    inventoryTransaction.note = note;
    inventoryTransaction.inventory = inventory;

    return manager
      .getRepository(InventoryTransaction)
      .save(inventoryTransaction);
  }
}
