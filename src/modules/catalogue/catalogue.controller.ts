import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CatalogueService } from './catalogue.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateProductDto,
  UpdateProductDto,
  CreateServiceDto,
  UpdateServiceDto,
} from './dtos/catalogue.dto';
import { ResponseDto, ListResponseDto } from '../../common/dtos/response.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly catalogueService: CatalogueService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<ResponseDto<any>> {
    const category =
      await this.catalogueService.createCategory(createCategoryDto);
    return new ResponseDto('SUCCESS', 'Category created', {
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
    });
  }

  @Get()
  async getAllCategories(): Promise<ResponseDto<any>> {
    const categories = await this.catalogueService.getAllCategories();
    return new ResponseDto('SUCCESS', 'Categories retrieved', {
      result: categories.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        image: c.image,
      })),
    });
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string): Promise<ResponseDto<any>> {
    const category = await this.catalogueService.getCategoryById(id);
    return new ResponseDto('SUCCESS', 'Category found', {
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
      productCount: category.products?.length || 0,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<ResponseDto<any>> {
    const category = await this.catalogueService.updateCategory(
      id,
      updateCategoryDto,
    );
    return new ResponseDto('SUCCESS', 'Category updated', {
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
    });
  }
}

@Controller('products')
export class ProductController {
  constructor(private readonly catalogueService: CatalogueService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ResponseDto<any>> {
    const product = await this.catalogueService.createProduct(createProductDto);
    return new ResponseDto('SUCCESS', 'Product created', {
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
    });
  }

  @Get()
  async getAllProducts(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ): Promise<ListResponseDto<any>> {
    const { products, total } = await this.catalogueService.getAllProducts(
      page,
      pageSize,
      search,
      categoryId,
    );

    return new ListResponseDto(
      products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        categoryId: p.categoryId,
        averageRating: p.averageRating,
        reviewCount: p.reviewCount,
        images: p.images,
      })),
      page,
      pageSize,
      total,
    );
  }

  @Get(':id')
  async getProductById(@Param('id') id: string): Promise<ResponseDto<any>> {
    const product = await this.catalogueService.getProductById(id);
    return new ResponseDto('SUCCESS', 'Product found', {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      averageRating: product.averageRating,
      reviewCount: product.reviewCount,
      images: product.images,
      category: product.category,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ResponseDto<any>> {
    const product = await this.catalogueService.updateProduct(
      id,
      updateProductDto,
    );
    return new ResponseDto('SUCCESS', 'Product updated', {
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
    });
  }
}

@Controller('services')
export class ServiceController {
  constructor(private readonly catalogueService: CatalogueService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createService(
    @Body() createServiceDto: CreateServiceDto,
  ): Promise<ResponseDto<any>> {
    const service = await this.catalogueService.createService(createServiceDto);
    return new ResponseDto('SUCCESS', 'Service created', {
      id: service.id,
      name: service.name,
      price: service.price,
      duration: service.duration,
    });
  }

  @Get()
  async getAllServices(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('search') search?: string,
  ): Promise<ListResponseDto<any>> {
    const { services, total } = await this.catalogueService.getAllServices(
      page,
      pageSize,
      search,
    );

    return new ListResponseDto(
      services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        price: s.price,
        duration: s.duration,
        averageRating: s.averageRating,
        reviewCount: s.reviewCount,
        images: s.images,
      })),
      page,
      pageSize,
      total,
    );
  }

  @Get(':id')
  async getServiceById(@Param('id') id: string): Promise<ResponseDto<any>> {
    const service = await this.catalogueService.getServiceById(id);
    return new ResponseDto('SUCCESS', 'Service found', {
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      averageRating: service.averageRating,
      reviewCount: service.reviewCount,
      images: service.images,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateService(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<ResponseDto<any>> {
    const service = await this.catalogueService.updateService(
      id,
      updateServiceDto,
    );
    return new ResponseDto('SUCCESS', 'Service updated', {
      id: service.id,
      name: service.name,
      price: service.price,
      duration: service.duration,
    });
  }
}
