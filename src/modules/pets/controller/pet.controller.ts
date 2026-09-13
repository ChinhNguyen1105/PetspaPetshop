import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Inject,
} from '@nestjs/common';

import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import { VsResponseUtil } from 'src/common/base/vs-response.util';
import { UrlConstant } from 'src/common/constants/url.constant';

import { ReqCreatePetDto } from 'src/modules/pets/dto/request/req-create-pet.dto';
import { ReqUpdatePetDto } from 'src/modules/pets/dto/request/req-update-pet.dto';

import type { PetService } from 'src/modules/pets/service/pet.service';
import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';
@RestApiV1()
@Controller()
export class PetController {
  constructor(
    @Inject(PROVIDER_TOKEN.PET_SERVICE)
    private readonly petService: PetService,
  ) {}
  @Get(UrlConstant.Pet.GET_PET_DETAIL.replace('{id}', ':id'))
  async getPetDetail(@Param('id') id: number) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.petService.getPetDetail(id),
    );
  }

  @Post(UrlConstant.Pet.CREATE_PET)
  async createPet(@Body() reqCreatePet: ReqCreatePetDto) {
    const petDto = await this.petService.createPet(reqCreatePet);

    return VsResponseUtil.successWithStatus(HttpStatus.OK, petDto);
  }

  @Put(UrlConstant.Pet.UPDATE_PET)
  async updatePet(@Body() reqUpdatePet: ReqUpdatePetDto) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.petService.updatePet(reqUpdatePet),
    );
  }

  @Delete(UrlConstant.Pet.DELETE_PET.replace('{id}', ':id'))
  async deletePet(@Param('id') id: number) {
    const commonResponseDto = await this.petService.deletePet(id);

    return VsResponseUtil.successWithStatus(HttpStatus.OK, commonResponseDto);
  }

  @Get(UrlConstant.Pet.GET_MY_PETS)
  async getMyPets() {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.petService.getMyPets(),
    );
  }

  @Patch(UrlConstant.Pet.PATCH_ACTIVATE_PET.replace('{id}', ':id'))
  async activatePet(@Param('id') id: number) {
    const commonResponseDto = await this.petService.activatePet(id);

    return VsResponseUtil.successWithStatus(HttpStatus.OK, commonResponseDto);
  }

  @Patch(UrlConstant.Pet.PATCH_DEACTIVATE_PET.replace('{id}', ':id'))
  async deactivatePet(@Param('id') id: number) {
    const commonResponseDto = await this.petService.deactivatePet(id);

    return VsResponseUtil.successWithStatus(HttpStatus.OK, commonResponseDto);
  }

  @Get(UrlConstant.Pet.GET_ALL_PETS)
  async getAllPets(
    @Query('filter') filter: string[] | undefined,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.petService.getAllPet(
        filter ?? [],
        Number(page),
        Number(pageSize),
      ),
    );
  }
}
