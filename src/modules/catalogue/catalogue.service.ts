import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { Service } from './entities/service.entity';
import { ProductImage } from './entities/product-image.entity';
import { ServiceImage } from './entities/service-image.entity';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateProductDto,
  UpdateProductDto,
  CreateServiceDto,
  UpdateServiceDto,
} from './dtos/catalogue.dto';

@Injectable()
export class CatalogueService {
  private readonly logger = new Logger(CatalogueService.name);

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(ProductImage)
    private productImageRepository: Repository<ProductImage>,
    @InjectRepository(ServiceImage)
    private serviceImageRepository: Repository<ServiceImage>,
  ) {}

  // ===== CATEGORY METHODS =====
  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const existing = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existing) {
      throw new BadRequestException('Category already exists');
    }

    const category = this.categoryRepository.create(createCategoryDto);
    const saved = await this.categoryRepository.save(category);
    this.logger.log(`Category created: ${saved.id}`);
    return saved;
  }

  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    return category;
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.getCategoryById(id);
    Object.assign(category, updateCategoryDto);
    const updated = await this.categoryRepository.save(category);
    this.logger.log(`Category updated: ${id}`);
    return updated;
  }

  // ===== PRODUCT METHODS =====
  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const category = await this.categoryRepository.findOne({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    const product = this.productRepository.create({
      ...createProductDto,
      isActive: true,
    });

    const saved = await this.productRepository.save(product);
    this.logger.log(`Product created: ${saved.id}`);
    return saved;
  }

  async getAllProducts(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    categoryId?: string,
  ) {
    const query = this.productRepository
      .createQueryBuilder('product')
      .where('product.isActive = :isActive', { isActive: true });

    if (search) {
      query.andWhere(
        '(product.name LIKE :search OR product.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      query.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    query.leftJoinAndSelect('product.images', 'images');
    query.leftJoinAndSelect('product.category', 'category');
    query.orderBy('product.createdAt', 'DESC');

    const skip = (page - 1) * pageSize;
    query.skip(skip).take(pageSize);

    const [products, total] = await query.getManyAndCount();
    return { products, total };
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['images', 'category'],
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    return product;
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.getProductById(id);
    Object.assign(product, updateProductDto);
    const updated = await this.productRepository.save(product);
    this.logger.log(`Product updated: ${id}`);
    return updated;
  }

  async addProductImage(
    productId: string,
    url: string,
    isMain: boolean = false,
  ): Promise<ProductImage> {
    const product = await this.getProductById(productId);

    if (isMain) {
      await this.productImageRepository.update(
        { productId },
        { isMain: false },
      );
    }

    const image = this.productImageRepository.create({
      productId,
      url,
      isMain,
    });

    return this.productImageRepository.save(image);
  }

  // ===== SERVICE METHODS =====
  async createService(createServiceDto: CreateServiceDto): Promise<Service> {
    const service = this.serviceRepository.create({
      ...createServiceDto,
      isActive: true,
    });

    const saved = await this.serviceRepository.save(service);
    this.logger.log(`Service created: ${saved.id}`);
    return saved;
  }

  async getAllServices(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
  ) {
    const query = this.serviceRepository
      .createQueryBuilder('service')
      .where('service.isActive = :isActive', { isActive: true });

    if (search) {
      query.andWhere(
        '(service.name LIKE :search OR service.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    query.leftJoinAndSelect('service.images', 'images');
    query.orderBy('service.createdAt', 'DESC');

    const skip = (page - 1) * pageSize;
    query.skip(skip).take(pageSize);

    const [services, total] = await query.getManyAndCount();
    return { services, total };
  }

  async getServiceById(id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['images'],
    });

    if (!service) {
      throw new BadRequestException('Service not found');
    }

    return service;
  }

  async updateService(
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    const service = await this.getServiceById(id);
    Object.assign(service, updateServiceDto);
    const updated = await this.serviceRepository.save(service);
    this.logger.log(`Service updated: ${id}`);
    return updated;
  }

  async getServicesByIds(serviceIds: string[]): Promise<Service[]> {
    return this.serviceRepository.findByIds(serviceIds);
  }
}
