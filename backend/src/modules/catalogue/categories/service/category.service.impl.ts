import { Injectable } from '@nestjs/common';

import { CategoryType } from 'src/common/constants/category-type.enum';
import { BadRequestException } from 'src/common/exceptions/bad-request.exception';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';

import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';
import {
  Meta,
  ResultPaginationDto,
} from 'src/common/dto/pagination/result-pagination.dto';

import { FilterProcessor } from 'src/common/specification/filter-processor';
import { SpecificationBuilder } from 'src/common/specification/specification-builder';

import { Category } from 'src/modules/catalogue/categories/entities/category.entity';
import { CategoryQueryDto } from 'src/modules/catalogue/categories/dto/request/category-query.dto';
import { ReqCreateCategoryDto } from 'src/modules/catalogue/categories/dto/request/req-create-category.dto';
import { ReqUpdateCategoryDto } from 'src/modules/catalogue/categories/dto/request/req-update-category.dto';
import { CategoryDto } from 'src/modules/catalogue/categories/dto/response/category.dto';

import { CategoryMapper } from 'src/modules/catalogue/categories/mapper/category.mapper';
import { CategoryRepository } from 'src/modules/catalogue/categories/repositories/category.repository';
import { CategoryService } from 'src/modules/catalogue/categories/service/category.service';

@Injectable()
export class CategoryServiceImpl implements CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly categoryMapper: CategoryMapper,
  ) {}

  async createCategory(req: ReqCreateCategoryDto): Promise<CategoryDto> {
    const exists = await this.categoryRepository.existsByNameAndDeleteFlagFalse(
      req.name,
    );

    if (exists) {
      throw new BadRequestException(
        `Category with name already exists: ${req.name}`,
      );
    }

    const category = new Category();

    category.name = req.name;

    category.categoryType =
      CategoryType[
        req.categoryType.trim().toUpperCase() as keyof typeof CategoryType
      ];

    const saved = await this.categoryRepository.getRepository().save(category);

    return this.categoryMapper.toDto(saved);
  }

  async updateCategory(req: ReqUpdateCategoryDto): Promise<CategoryDto> {
    const category = await this.getCategoryById(req.id);

    if (
      category.name !== req.name &&
      (await this.categoryRepository.existsByNameAndDeleteFlagFalse(req.name))
    ) {
      throw new BadRequestException(
        `Category with name already exists: ${req.name}`,
      );
    }

    category.name = req.name;

    category.categoryType =
      CategoryType[
        req.categoryType.trim().toUpperCase() as keyof typeof CategoryType
      ];

    const saved = await this.categoryRepository.getRepository().save(category);

    return this.categoryMapper.toDto(saved);
  }

  async deleteCategory(id: number): Promise<CommonResponseDto> {
    const category = await this.categoryRepository.getRepository().findOne({
      where: { id },
      relations: {
        products: true,
        petServices: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`Category not found with ID: ${id}`);
    }

    if (category.deleteFlag) {
      throw new NotFoundException(`Category deleted with ID: ${id}`);
    }

    const hasActiveProduct = category.products?.some(
      (product) => product.deleteFlag === false,
    );

    if (hasActiveProduct) {
      throw new BadRequestException(
        'Can not delete Category when Product is using this Category',
      );
    }

    const hasActiveService = category.petServices?.some(
      (service) => service.deleteFlag === false,
    );

    if (hasActiveService) {
      throw new BadRequestException(
        'Can not delete Category when PetService is using this Category',
      );
    }

    category.deleteFlag = true;

    await this.categoryRepository.getRepository().save(category);

    return {
      status: true,
      message: 'Delete Category success',
    };
  }

  async getCategories(query: CategoryQueryDto): Promise<ResultPaginationDto> {
    const page = query.page;

    const pageSize = query.pageSize;

    const filter = query.filter ?? [];

    const queryBuilder = this.categoryRepository
      .getRepository()
      .createQueryBuilder('category');

    queryBuilder.andWhere('category.delete_flag = :deleteFlag', {
      deleteFlag: false,
    });

    const specificationBuilder = new SpecificationBuilder<Category>();

    FilterProcessor.process(specificationBuilder, filter);

    specificationBuilder.apply(queryBuilder, 'category');

    queryBuilder
      .orderBy('category.created_date', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [categories, total] = await queryBuilder.getManyAndCount();

    return this.buildPaginationResponse(
      this.categoryMapper.toDtoList(categories),
      page,
      pageSize,
      total,
    );
  }

  async getCategoryById(id: number): Promise<Category> {
    const category = await this.categoryRepository.getRepository().findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category not found with ID: ${id}`);
    }

    if (category.deleteFlag) {
      throw new NotFoundException(`Category deleted with ID: ${id}`);
    }

    return category;
  }

  async getCategoryDetail(id: number): Promise<CategoryDto> {
    const category = await this.getCategoryById(id);

    return this.categoryMapper.toDto(category);
  }

  private buildPaginationResponse(
    data: CategoryDto[],
    page: number,
    pageSize: number,
    total: number,
  ): ResultPaginationDto {
    const result = new ResultPaginationDto();

    const meta = new Meta();

    meta.page = page;
    meta.pageSize = pageSize;
    meta.pages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;
    meta.total = total;

    result.meta = meta;
    result.result = data;

    return result;
  }
}
