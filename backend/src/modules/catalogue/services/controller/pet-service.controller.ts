
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import { VsResponseUtil } from 'src/common/base/vs-response.util';
import { UrlConstant } from 'src/common/constants/url.constant';
import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

import { ReqCreateServiceDto } from 'src/modules/catalogue/services/dto/request/req-create-service.dto';
import { ReqUpdateServiceDto } from 'src/modules/catalogue/services/dto/request/req-update-service.dto';
import { ServiceQueryDto } from 'src/modules/catalogue/services/dto/request/service-query.dto';

import { ReqRecommendationDto } from 'src/modules/recommendation/dto/request/req-recommendation.dto';
import { ResRecommendationDto } from 'src/modules/recommendation/dto/response/res-recommendation.dto';

import type { PetServiceService } from 'src/modules/catalogue/services/service/pet-service.service';

@RestApiV1()
@Controller()
export class PetServiceController {
  constructor(
    @Inject(PROVIDER_TOKEN.PET_SERVICE_SERVICE)
    private readonly petServiceService: PetServiceService,
  ) {}

  @Post(UrlConstant.PetService.CREATE_SERVICE)
  async createService(@Body() req: ReqCreateServiceDto) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.CREATED,
      await this.petServiceService.createService(req),
    );
  }

  @Put(UrlConstant.PetService.UPDATE_SERVICE)
  async updateService(@Body() req: ReqUpdateServiceDto) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.petServiceService.updateService(req),
    );
  }

  @Get(UrlConstant.PetService.GET_ALL_SERVICES)
  async getAllServices(@Query() query: ServiceQueryDto) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.petServiceService.getAllServices(query),
    );
  }

  @Get(UrlConstant.PetService.GET_TOP_SERVICES)
  async getTopServices(
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.petServiceService.getTopServices(limit),
    );
  }

  @Post(UrlConstant.PetService.GET_RECOMMENDATIONS)
  async recommendServices(@Body() req: ReqRecommendationDto) {
    const recommendedItemIds =
      await this.petServiceService.getRecommendedServiceIds(req.itemIds);

    const response = new ResRecommendationDto();
    response.recommendedItemIds = recommendedItemIds;

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      response,
    );
  }

  @Get(UrlConstant.PetService.GET_SERVICE)
  async getService(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.petServiceService.getServiceById(id),
    );
  }

  @Delete(UrlConstant.PetService.DELETE_SERVICE)
  async deleteService(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.NO_CONTENT,
      await this.petServiceService.deleteService(id),
    );
  }
}