import { Injectable, Logger } from '@nestjs/common';

import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';
import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { FilterProcessor } from 'src/common/specification/filter-processor';
import { SpecificationBuilder } from 'src/common/specification/specification-builder';

import { CategoryRepository } from 'src/modules/catalogue/categories/repositories/category.repository';
import { PetService } from 'src/modules/catalogue/services/entities/pet-service.entity';
import { ReqCreateServiceDto } from 'src/modules/catalogue/services/dto/request/req-create-service.dto';
import { ReqUpdateServiceDto } from 'src/modules/catalogue/services/dto/request/req-update-service.dto';
import { ServiceDto } from 'src/modules/catalogue/services/dto/response/service.dto';
import { ServiceMapper } from 'src/modules/catalogue/services/mapper/service.mapper';
import { PetServiceRepository } from 'src/modules/catalogue/services/repositories/pet-service.repository';
import { PetServiceService } from 'src/modules/catalogue/services/service/pet-service.service';

import type { RecommendationService } from 'src/modules/recommendation/service/recommendation.service';
import type { PetServiceReviewService } from 'src/modules/reviews/service/pet-service-review.service';

@Injectable()
export class PetServiceServiceImpl
  implements PetServiceService
{
  private readonly logger = new Logger(
    PetServiceServiceImpl.name,
  );

  constructor(
    private readonly petServiceRepository: PetServiceRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly serviceMapper: ServiceMapper,
    private readonly reviewService: PetServiceReviewService,
    private readonly recommendationService: RecommendationService,
  ) {}

  async createService(
    req: ReqCreateServiceDto,
  ): Promise<ServiceDto> {
    this.logger.log(
      `[SERVICE] Creating new service: ${req.name}`,
    );

    const category =
      await this.categoryRepository
        .getRepository()
        .findOne({
          where: {
            id: req.categoryId,
          },
        });

    if (!category) {
      throw new NotFoundException(
        '[SERVICE] Category not found',
      );
    }

    const service = new PetService();

    service.name = req.name;
    service.description = req.description;
    service.basePrice = req.basePrice;
    service.durationMin = req.durationMin;
    service.category = category;

    const saved =
      await this.petServiceRepository
        .getRepository()
        .save(service);

    this.logger.log(
      `[SERVICE] Service created successfully with ID: ${saved.id}`,
    );

    const dto = this.serviceMapper.toDto(saved);

    await this.enrichServiceDto(dto);

    return dto;
  }

  async updateService(
    req: ReqUpdateServiceDto,
  ): Promise<ServiceDto> {
    this.logger.log(
      `[SERVICE] Updating service with ID: ${req.id}`,
    );

    const service =
      await this.petServiceRepository
        .getRepository()
        .findOne({
          where: {
            id: req.id,
          },
          relations: {
            category: true,
            serviceImages: true,
          },
        });

    if (!service) {
      throw new NotFoundException(
        '[SERVICE] Service not found',
      );
    }

    if (req.name !== null && req.name !== undefined) {
      service.name = req.name;
    }

    if (
      req.description !== null &&
      req.description !== undefined
    ) {
      service.description = req.description;
    }

    if (
      req.basePrice !== null &&
      req.basePrice !== undefined
    ) {
      service.basePrice = req.basePrice;
    }

    if (
      req.durationMin !== null &&
      req.durationMin !== undefined
    ) {
      service.durationMin = req.durationMin;
    }

    if (
      req.categoryId !== null &&
      req.categoryId !== undefined
    ) {
      const category =
        await this.categoryRepository
          .getRepository()
          .findOne({
            where: {
              id: req.categoryId,
            },
          });

      if (!category) {
        throw new NotFoundException(
          '[SERVICE] Category not found',
        );
      }

      service.category = category;
    }

    const updated =
      await this.petServiceRepository
        .getRepository()
        .save(service);

    const dto = this.serviceMapper.toDto(updated);

    await this.enrichServiceDto(dto);

    return dto;
  }

  async deleteService(
    id: number,
  ): Promise<CommonResponseDto> {
    this.logger.log(
      `[SERVICE] Deleting service with ID: ${id}`,
    );

    const service =
      await this.petServiceRepository
        .getRepository()
        .findOne({
          where: {
            id,
          },
        });

    if (!service) {
      throw new NotFoundException(
        '[SERVICE] Service not found',
      );
    }

    service.deleteFlag = true;
    service.activeFlag = false;

    await this.petServiceRepository
      .getRepository()
      .save(service);

    this.logger.log(
      '[SERVICE] Service marked as deleted',
    );

    return {
      status: true,
      message: 'Service deleted successfully',
    };
  }

  async getServiceById(
    id: number,
  ): Promise<ServiceDto> {
    this.logger.log(
      `[SERVICE] Getting service with ID: ${id}`,
    );

    const service =
      await this.petServiceRepository
        .getRepository()
        .findOne({
          where: {
            id,
            deleteFlag: false,
            activeFlag: true,
          },
          relations: {
            category: true,
            serviceImages: true,
          },
        });

    if (!service) {
      throw new NotFoundException(
        '[SERVICE] Service not found',
      );
    }

    const dto = this.serviceMapper.toDto(service);

    await this.enrichServiceDto(dto);

    return dto;
  }

  async getAllServices(
    filter: string[],
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto> {
    this.logger.log(
      '[SERVICE] Getting all services with pagination',
    );

    const queryBuilder =
      this.petServiceRepository
        .getRepository()
        .createQueryBuilder('service')
        .leftJoinAndSelect(
          'service.category',
          'category',
        )
        .leftJoinAndSelect(
          'service.serviceImages',
          'serviceImages',
        )
        .where('service.deleteFlag = false')
        .andWhere('service.activeFlag = true');

    const specificationBuilder =
      new SpecificationBuilder<PetService>();

    FilterProcessor.process(
      specificationBuilder,
      filter,
    );

    specificationBuilder.apply(
      queryBuilder,
      'service',
    );

    queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [services, total] =
      await queryBuilder.getManyAndCount();

    const dtos: ServiceDto[] = [];

    for (const service of services) {
      const dto = this.serviceMapper.toDto(service);

      await this.enrichServiceDto(dto);

      dtos.push(dto);
    }

    return {
      result: dtos,
      meta: {
        page,
        pageSize,
        pages: Math.ceil(total / pageSize),
        total,
      },
    };
  }

  async searchServices(
    keyword: string,
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto> {
    this.logger.log(
      `[SERVICE] Searching services with keyword: ${keyword}`,
    );

    const [services, total] =
      await this.petServiceRepository
        .getRepository()
        .createQueryBuilder('service')
        .leftJoinAndSelect(
          'service.category',
          'category',
        )
        .leftJoinAndSelect(
          'service.serviceImages',
          'serviceImages',
        )
        .where('service.deleteFlag = false')
        .andWhere('service.activeFlag = true')
        .andWhere(
          'LOWER(service.name) LIKE LOWER(:keyword)',
          {
            keyword: `%${keyword}%`,
          },
        )
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getManyAndCount();

    const dtos: ServiceDto[] = [];

    for (const service of services) {
      const dto = this.serviceMapper.toDto(service);

      await this.enrichServiceDto(dto);

      dtos.push(dto);
    }

    return {
      result: dtos,
      meta: {
        page,
        pageSize,
        pages: Math.ceil(total / pageSize),
        total,
      },
    };
  }

  async getServicesByCategory(
    categoryId: number,
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto> {
    this.logger.log(
      `[SERVICE] Getting services by category: ${categoryId}`,
    );

    const [services, total] =
      await this.petServiceRepository
        .getRepository()
        .createQueryBuilder('service')
        .leftJoinAndSelect(
          'service.category',
          'category',
        )
        .leftJoinAndSelect(
          'service.serviceImages',
          'serviceImages',
        )
        .where('service.deleteFlag = false')
        .andWhere('service.activeFlag = true')
        .andWhere('category.id = :categoryId', {
          categoryId,
        })
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getManyAndCount();

    const dtos: ServiceDto[] = [];

    for (const service of services) {
      const dto = this.serviceMapper.toDto(service);

      await this.enrichServiceDto(dto);

      dtos.push(dto);
    }

    return {
      result: dtos,
      meta: {
        page,
        pageSize,
        pages: Math.ceil(total / pageSize),
        total,
      },
    };
  }

  async getTopServices(
    limit: number,
  ): Promise<ServiceDto[]> {
    this.logger.log(
      `[SERVICE] Getting top ${limit} services`,
    );

    const [services] =
      await this.petServiceRepository
        .getRepository()
        .createQueryBuilder('service')
        .leftJoinAndSelect(
          'service.category',
          'category',
        )
        .leftJoinAndSelect(
          'service.serviceImages',
          'serviceImages',
        )
        .where('service.deleteFlag = false')
        .andWhere('service.activeFlag = true')
        .take(limit)
        .getManyAndCount();

    const dtos: ServiceDto[] = [];

    for (const service of services) {
      const dto = this.serviceMapper.toDto(service);

      await this.enrichServiceDto(dto);

      dtos.push(dto);
    }

    return dtos;
  }

  async getRecommendedServiceIds(
    serviceIds: number[],
  ): Promise<number[]> {
    return this.recommendationService.recommendServices(
      serviceIds,
    );
  }

  private async enrichServiceDto(
    dto: ServiceDto,
  ): Promise<void> {
    if (dto.id !== null && dto.id !== undefined) {
      dto.averageRating =
        await this.reviewService.getAverageRating(
          dto.id,
        );

      dto.totalReviews =
        await this.reviewService.getReviewCount(
          dto.id,
        );
    }
  }
}
