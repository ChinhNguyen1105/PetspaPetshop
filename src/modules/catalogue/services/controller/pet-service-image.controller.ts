
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import { VsResponseUtil } from 'src/common/base/vs-response.util';
import { UrlConstant } from 'src/common/constants/url.constant';
import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

import { ReqAddServiceImageDto } from 'src/modules/catalogue/services/dto/request/req-add-service-image.dto';
import type { PetServiceImageService } from 'src/modules/catalogue/services/service/pet-service-image.service';

@RestApiV1()
@Controller()
export class PetServiceImageController {
  constructor(
    @Inject(PROVIDER_TOKEN.PET_SERVICE_IMAGE_SERVICE)
    private readonly serviceImageService: PetServiceImageService,
  ) {}

  @Post(UrlConstant.PetServiceImages.ADD_IMAGES)
  async addImage(
    @Body() req: ReqAddServiceImageDto,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.CREATED,
      await this.serviceImageService.addImage(req),
    );
  }

  @Delete(
    UrlConstant.PetServiceImages.DELETE_IMAGE.replace(
      '{id}',
      ':id',
    ),
  )
  async deleteImage(
    @Param('id') id: number,
  ) {
    await this.serviceImageService.deleteImage(id);

    return VsResponseUtil.successWithStatus(
      HttpStatus.NO_CONTENT,
      null,
    );
  }

  @Get(
    UrlConstant.PetServiceImages.GET_SERVICE_IMAGES.replace(
      '{serviceId}',
      ':serviceId',
    ),
  )
  async getServiceImages(
    @Param('serviceId') serviceId: number,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.serviceImageService.getServiceImages(
        serviceId,
      ),
    );
  }

  @Patch(
    UrlConstant.PetServiceImages.SET_MAIN_IMAGE,
  )
  async setMainImage(
    @Query('imageId') imageId: number,
  ) {
    await this.serviceImageService.setMainImage(
      Number(imageId),
    );

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      null,
    );
  }
}

