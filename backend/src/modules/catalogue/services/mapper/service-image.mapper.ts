import { Injectable } from '@nestjs/common';

import { PetServiceImage } from 'src/modules/catalogue/services/entities/pet-service-image.entity';
import { ServiceImageDto } from 'src/modules/catalogue/services/dto/response/service-image.dto';

@Injectable()
export class ServiceImageMapper {
  toDto(image: PetServiceImage): ServiceImageDto {
    const dto = Object.assign(new ServiceImageDto(), image);

    dto.serviceId = image.petService?.id ?? null;

    return dto;
  }

  toDtos(images: PetServiceImage[]): ServiceImageDto[] {
    return images.map((image) => this.toDto(image));
  }

  toEntity(dto: ServiceImageDto): PetServiceImage {
    return Object.assign(new PetServiceImage(), dto);
  }
}
