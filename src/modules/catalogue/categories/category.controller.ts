import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import { VsResponseUtil } from 'src/common/base/vs-response.util';
import { UrlConstant } from 'src/common/constants/url.constant';
import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

import { ReqCreateCategoryDto } from 'src/modules/catalogue/categories/dto/request/req-create-category.dto';
import { CategoryQueryDto } from 'src/modules/catalogue/categories/dto/request/category-query.dto';
import { ReqUpdateCategoryDto } from 'src/modules/catalogue/categories/dto/request/req-update-category.dto';

import type { CategoryService } from 'src/modules/catalogue/categories/service/category.service';

@RestApiV1()
@Controller()
export class CategoryController {
  constructor(
    @Inject(PROVIDER_TOKEN.CATEGORY_SERVICE)
    private readonly categoryService: CategoryService,
  ) {}

  /*
  |--------------------------------------------------------------------------
  | PUBLIC
  |--------------------------------------------------------------------------
  */

  @Get(UrlConstant.Category.GET_CATEGORIES)
  async getCategories(
    @Query()
    query: CategoryQueryDto,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.categoryService.getCategories(query),
    );
  }

  @Get(UrlConstant.Category.GET_CATEGORY)
  async getCategoryDetail(@Param('id') id: number) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.categoryService.getCategoryDetail(Number(id)),
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ADMIN
  |--------------------------------------------------------------------------
  */

  @Post(UrlConstant.Category.CREATE_CATEGORY)
  async createCategory(
    @Body()
    req: ReqCreateCategoryDto,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.CREATED,
      await this.categoryService.createCategory(req),
    );
  }

  @Put(UrlConstant.Category.UPDATE_CATEGORY)
  async updateCategory(
    @Body()
    req: ReqUpdateCategoryDto,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.categoryService.updateCategory(req),
    );
  }

  @Delete(UrlConstant.Category.DELETE_CATEGORY)
  async deleteCategory(@Param('id') id: string) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.categoryService.deleteCategory(Number(id)),
    );
  }
}
