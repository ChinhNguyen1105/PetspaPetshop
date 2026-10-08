import { Injectable } from '@nestjs/common';

import { PetService } from 'src/modules/catalogue/services/entities/pet-service.entity';
import { ServiceDto } from 'src/modules/catalogue/services/dto/response/service.dto';
import { ServiceImageMapper } from 'src/modules/catalogue/services/mapper/service-image.mapper';

@Injectable()
export class ServiceMapper {
  constructor(
    private readonly serviceImageMapper: ServiceImageMapper,
  ) {}

  toDto(service: PetService): ServiceDto {
    const dto = new ServiceDto();

    dto.id = service.id;
    dto.name = service.name;
    dto.description = service.description;
    dto.basePrice = service.basePrice;
    dto.durationMin = service.durationMin;

    dto.categoryId = service.category?.id ?? null;
    dto.categoryName = service.category?.name ?? null;

    dto.serviceImages = service.serviceImages
      ? this.serviceImageMapper.toDtos(service.serviceImages)
      : [];

    dto.createdDate = service.createdDate;
    dto.lastModifiedDate = service.lastModifiedDate;

    return dto;
  }

  toDtos(services: PetService[]): ServiceDto[] {
    return services.map((service) => this.toDto(service));
  }

  toEntity(dto: ServiceDto): PetService {
    return Object.assign(new PetService(), dto);
  }
}
