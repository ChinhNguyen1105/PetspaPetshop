
import { Injectable, Logger } from '@nestjs/common';

import { NotFoundException } from 'src/common/exceptions/not-found.exception';

import { ReqAddServiceImageDto } from 'src/modules/catalogue/services/dto/request/req-add-service-image.dto';
import { ServiceImageDto } from 'src/modules/catalogue/services/dto/response/service-image.dto';

import { PetServiceImage } from 'src/modules/catalogue/services/entities/pet-service-image.entity';

import { ServiceImageMapper } from 'src/modules/catalogue/services/mapper/service-image.mapper';

import { PetServiceImageRepository } from 'src/modules/catalogue/services/repositories/pet-service-image.repository';
import { PetServiceRepository } from 'src/modules/catalogue/services/repositories/pet-service.repository';

import type { PetServiceImageService } from 'src/modules/catalogue/services/service/pet-service-image.service';

@Injectable()
export class PetServiceImageServiceImpl
  implements PetServiceImageService
{
  private readonly logger = new Logger(
    PetServiceImageServiceImpl.name,
  );

  constructor(
    private readonly imageRepository: PetServiceImageRepository,
    private readonly serviceRepository: PetServiceRepository,
    private readonly imageMapper: ServiceImageMapper,
  ) {}

  async addImage(
    req: ReqAddServiceImageDto,
  ): Promise<ServiceImageDto> {
    this.logger.log(
      `[SERVICE_IMAGE] Adding image to service: ${req.serviceId}`,
    );

    const service =
      await this.serviceRepository
        .getRepository()
        .findOne({
          where: {
            id: req.serviceId,
          },
        });

    if (!service) {
      throw new NotFoundException(
        '[SERVICE_IMAGE] Service not found',
      );
    }

    if (
      req.isThumbnail !== null &&
      req.isThumbnail === true
    ) {
      const currentThumbnail =
        await this.imageRepository
          .findByPetServiceIdAndIsThumbnailTrue(
            req.serviceId,
          );

      if (currentThumbnail) {
        currentThumbnail.isThumbnail = false;

        await this.imageRepository
          .getRepository()
          .save(currentThumbnail);
      }
    }

    const image = new PetServiceImage();

    image.imageUrl = req.imageUrl;

    image.isThumbnail =
      req.isThumbnail !== null
        ? req.isThumbnail
        : false;

    image.petService = service;

    const saved =
      await this.imageRepository
        .getRepository()
        .save(image);

    this.logger.log(
      `[SERVICE_IMAGE] Image added successfully with ID: ${saved.id}`,
    );

    return this.imageMapper.toDto(saved);
  }

  async deleteImage(
    imageId: number,
  ): Promise<void> {
    this.logger.log(
      `[SERVICE_IMAGE] Deleting image with ID: ${imageId}`,
    );

    const image =
      await this.imageRepository
        .getRepository()
        .findOne({
          where: {
            id: imageId,
          },
        });

    if (!image) {
      throw new NotFoundException(
        '[SERVICE_IMAGE] Image not found',
      );
    }

    await this.imageRepository
      .getRepository()
      .remove(image);

    this.logger.log(
      '[SERVICE_IMAGE] Image deleted successfully',
    );
  }

  async getServiceImages(
    serviceId: number,
  ): Promise<ServiceImageDto[]> {
    this.logger.log(
      `[SERVICE_IMAGE] Getting images for service: ${serviceId}`,
    );

    const service =
      await this.serviceRepository
        .getRepository()
        .findOne({
          where: {
            id: serviceId,
          },
        });

    if (!service) {
      throw new NotFoundException(
        '[SERVICE_IMAGE] Service not found',
      );
    }

    const images =
      await this.imageRepository
        .findByPetServiceId(serviceId);

    return this.imageMapper.toDtos(images);
  }

  async setMainImage(
    imageId: number,
  ): Promise<void> {
    this.logger.log(
      `[SERVICE_IMAGE] Setting main image: ${imageId}`,
    );

    const image =
      await this.imageRepository
        .getRepository()
        .findOne({
          where: {
            id: imageId,
          },
          relations: {
            petService: true,
          },
        });

    if (!image) {
      throw new NotFoundException(
        '[SERVICE_IMAGE] Image not found',
      );
    }

    const serviceId =
      image.petService?.id;

    if (serviceId === undefined) {
      throw new NotFoundException(
        '[SERVICE_IMAGE] Service not found',
      );
    }

    const currentThumbnail =
      await this.imageRepository
        .findByPetServiceIdAndIsThumbnailTrue(
          serviceId,
        );

    if (
      currentThumbnail &&
      currentThumbnail.id !== image.id
    ) {
      currentThumbnail.isThumbnail = false;

      await this.imageRepository
        .getRepository()
        .save(currentThumbnail);
    }

    image.isThumbnail = true;

    await this.imageRepository
      .getRepository()
      .save(image);

    this.logger.log(
      '[SERVICE_IMAGE] Main image set successfully',
    );
  }

  async deleteAllServiceImages(
    serviceId: number,
  ): Promise<void> {
    this.logger.log(
      `[SERVICE_IMAGE] Deleting all images for service: ${serviceId}`,
    );

    const images =
      await this.imageRepository
        .findByPetServiceId(serviceId);

    if (images.length > 0) {
      await this.imageRepository
        .getRepository()
        .remove(images);
    }

    this.logger.log(
      `[SERVICE_IMAGE] All images deleted for service: ${serviceId}`,
    );
  }
}

