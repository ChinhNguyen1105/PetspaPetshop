import { Injectable, Logger } from '@nestjs/common';

import { TypeInventory } from 'src/common/constants/type-inventory.enum';
import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';
import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';
import { ConflictException } from 'src/common/exceptions/conflict.exception';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { FilterProcessor } from 'src/common/specification/filter-processor';
import { SpecificationBuilder } from 'src/common/specification/specification-builder';

import { CategoryRepository } from 'src/modules/catalogue/categories/repositories/category.repository';
import { ReqCreateProductDto } from 'src/modules/catalogue/products/dto/request/req-create-product.dto';
import { ReqUpdateProductDto } from 'src/modules/catalogue/products/dto/request/req-update-product.dto';
import { ProductDto } from 'src/modules/catalogue/products/dto/response/product.dto';
import { Product } from 'src/modules/catalogue/products/entities/product.entity';
import { ProductMapper } from 'src/modules/catalogue/products/mapper/product.mapper';
import { ProductRepository } from 'src/modules/catalogue/products/repositories/product.repository';

import { Inventory } from 'src/modules/inventory/entities/inventory.entity';
import { InventoryTransaction } from 'src/modules/inventory/entities/inventory-transaction.entity';
import { InventoryRepository } from 'src/modules/inventory/repositories/inventory.repository';
import { InventoryTransactionRepository } from 'src/modules/inventory/repositories/inventory-transaction.repository';

import type { RecommendationService } from 'src/modules/recommendation/service/recommendation.service';
import { Inject } from '@nestjs/common';
import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';
import type { ProductService } from 'src/modules/catalogue/products/service/product.service';
@Injectable()
export class ProductServiceImpl implements ProductService {
  private readonly logger = new Logger(ProductServiceImpl.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productMapper: ProductMapper,
    private readonly categoryRepository: CategoryRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly inventoryTransactionRepository: InventoryTransactionRepository,
    @Inject(PROVIDER_TOKEN.RECOMMENDATION_SERVICE)
    private readonly recommendationService: RecommendationService,
  ) {}

  private async checkExistProductByName(name: string): Promise<void> {
    this.logger.log(`[CHECK] Kiểm tra trùng lặp tên sản phẩm: '${name}'`);

    const exists =
      await this.productRepository.existsByNameAndDeleteFlagFalse(name);

    if (exists) {
      throw new ConflictException(`Product already exists with name: ${name}`);
    }
  }

  async createProduct(
    reqCreateProduct: ReqCreateProductDto,
  ): Promise<ProductDto> {
    this.logger.log(
      `[CREATE] Bắt đầu tạo sản phẩm: '${reqCreateProduct.name}'`,
    );

    await this.checkExistProductByName(reqCreateProduct.name);

    const product = this.productMapper.toProduct(reqCreateProduct);

    const category = await this.categoryRepository.getRepository().findOne({
      where: {
        id: reqCreateProduct.categoryId,
      },
    });

    if (!category) {
      throw new NotFoundException(
        `Category not found with id: ${reqCreateProduct.categoryId}`,
      );
    }

    product.category = category;

    const savedProduct = await this.productRepository
      .getRepository()
      .save(product);

    this.logger.log(`[CREATE] Product created with ID: ${savedProduct.id}`);

    const inventory = new Inventory();

    inventory.quantity = reqCreateProduct.quantity ?? 0;
    inventory.product = savedProduct;

    const savedInventory = await this.inventoryRepository
      .getRepository()
      .save(inventory);

    savedProduct.inventory = savedInventory;

    if (
      reqCreateProduct.quantity !== null &&
      reqCreateProduct.quantity !== undefined &&
      reqCreateProduct.quantity > 0
    ) {
      await this.createInventoryTransaction(
        savedInventory,
        reqCreateProduct.quantity,
        TypeInventory.IMPORT,
        'Nhập kho khi tạo sản phẩm',
      );
    }

    return this.productMapper.toProductDto(savedProduct);
  }

  async updateProduct(
    reqUpdateProduct: ReqUpdateProductDto,
  ): Promise<ProductDto> {
    this.logger.log(`[UPDATE] Cập nhật sản phẩm ID: ${reqUpdateProduct.id}`);

    const product = await this.productRepository.getRepository().findOne({
      where: {
        id: reqUpdateProduct.id,
      },
      relations: {
        category: true,
        inventory: true,
      },
    });

    if (!product) {
      throw new NotFoundException(
        `Product not found with id: ${reqUpdateProduct.id}`,
      );
    }

    if (product.activeFlag === false || product.deleteFlag === true) {
      throw new NotFoundException(
        `Product not found with id: ${reqUpdateProduct.id}`,
      );
    }

    if (product.name !== reqUpdateProduct.name) {
      await this.checkExistProductByName(reqUpdateProduct.name);
    }

    product.name = reqUpdateProduct.name;
    product.description = reqUpdateProduct.description;
    product.price = reqUpdateProduct.price;

    if (reqUpdateProduct.categoryId !== null) {
      const category = await this.categoryRepository.getRepository().findOne({
        where: {
          id: reqUpdateProduct.categoryId,
        },
      });

      if (!category) {
        throw new NotFoundException(
          `Category not found with id: ${reqUpdateProduct.categoryId}`,
        );
      }

      product.category = category;
    }

    if (
      reqUpdateProduct.quantity !== null &&
      reqUpdateProduct.quantity !== undefined
    ) {
      let inventory = product.inventory;

      if (!inventory) {
        inventory = new Inventory();

        inventory.quantity = reqUpdateProduct.quantity;
        inventory.product = product;

        inventory = await this.inventoryRepository
          .getRepository()
          .save(inventory);

        product.inventory = inventory;

        if (reqUpdateProduct.quantity > 0) {
          await this.createInventoryTransaction(
            inventory,
            reqUpdateProduct.quantity,
            TypeInventory.IMPORT,
            'Nhập kho khi cập nhật sản phẩm',
          );
        }
      } else {
        const oldQuantity = inventory.quantity ?? 0;
        const newQuantity = reqUpdateProduct.quantity;
        const delta = newQuantity - oldQuantity;

        if (delta !== 0) {
          inventory.quantity = newQuantity;

          await this.inventoryRepository.getRepository().save(inventory);
        }

        const type = delta > 0 ? TypeInventory.IMPORT : TypeInventory.EXPORT;

        const inventoryTransaction = new InventoryTransaction();

        inventoryTransaction.quantity = Math.abs(delta);
        inventoryTransaction.type = type;
        inventoryTransaction.note = 'Cập nhật kho khi cập nhật sản phẩm';
        inventoryTransaction.inventory = inventory;

        await this.inventoryTransactionRepository
          .getRepository()
          .save(inventoryTransaction);
      }
    }

    const updatedProduct = await this.productRepository
      .getRepository()
      .save(product);

    return this.productMapper.toProductDto(updatedProduct);
  }

  async deleteProduct(id: number): Promise<CommonResponseDto> {
    this.logger.log(`[DELETE] Xóa mềm sản phẩm ID: ${id}`);

    const product = await this.productRepository.getRepository().findOne({
      where: {
        id,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product not found with id: ${id}`);
    }

    product.deleteFlag = true;

    await this.productRepository.getRepository().save(product);

    return {
      status: true,
      message: 'Delete product successfully',
    };
  }

  async getProductById(id: number): Promise<ProductDto> {
    const product = await this.productRepository.getRepository().findOne({
      where: {
        id,
      },
      relations: {
        category: true,
        inventory: true,
      },
    });

    if (!product || product.deleteFlag === true) {
      throw new NotFoundException(`Product not found with id: ${id}`);
    }

    return this.productMapper.toProductDto(product);
  }

  async getAllProduct(
    filter: string[],
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto> {
    const repository = this.productRepository.getRepository();

    const queryBuilder = repository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.inventory', 'inventory')
      .where('product.deleteFlag = false');

    const specificationBuilder = new SpecificationBuilder<Product>();

    FilterProcessor.process(specificationBuilder, filter);

    specificationBuilder.apply(queryBuilder, 'product');

    queryBuilder.skip((page - 1) * pageSize).take(pageSize);

    const [products, total] = await queryBuilder.getManyAndCount();

    return {
      result: this.productMapper.productDtos(products),
      meta: {
        page,
        pageSize,
        pages: Math.ceil(total / pageSize),
        total,
      },
    };
  }

  async getRecommendedProductIds(productIds: number[]): Promise<number[]> {
    return this.recommendationService.recommendProducts(productIds);
  }

  private async createInventoryTransaction(
    inventory: Inventory,
    quantity: number,
    type: TypeInventory,
    note: string,
  ): Promise<void> {
    const inventoryTransaction = new InventoryTransaction();

    inventoryTransaction.quantity = quantity;
    inventoryTransaction.type = type;
    inventoryTransaction.note = note;
    inventoryTransaction.inventory = inventory;

    await this.inventoryTransactionRepository
      .getRepository()
      .save(inventoryTransaction);
  }
}
