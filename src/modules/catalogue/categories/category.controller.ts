import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import { VsResponseUtil } from 'src/common/base/vs-response.util';
import { UrlConstant } from 'src/common/constants/url.constant';

import { ReqCreateCategoryDto } from 'src/modules/catalogue/categories/dto/req-create-category.dto';
import { ReqUpdateCategoryDto } from 'src/modules/catalogue/categories/dto/request/req-update-category.dto';
import type { CategoryService } from 'src/modules/catalogue/categories/service/category.service';
import { Inject } from '@nestjs/common';

import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';


@RestApiV1()
@Controller()
export class CategoryController {
  constructor(
    @Inject(PROVIDER_TOKEN.CATEGORY_SERVICE)
    private readonly categoryService: CategoryService,
  ) {}

  // Public
  @Get(UrlConstant.Category.GET_CATEGORIES)
  async getCategories() {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.categoryService.getCategories(),
    );
  }

  @Get(UrlConstant.Category.GET_CATEGORY)
  async getCategoryDetail(@Param('id') id: string) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.categoryService.getCategoryDetail(Number(id)),
    );
  }

  // Admin
  @Post(UrlConstant.Category.CREATE_CATEGORY)
  async createCategory(@Body() req: ReqCreateCategoryDto) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.CREATED,
      await this.categoryService.createCategory(req),
    );
  }

  @Put(UrlConstant.Category.UPDATE_CATEGORY)
  async updateCategory(@Body() req: ReqUpdateCategoryDto) {
    return this.categoryService.updateCategory(req);
  }

  @Delete(UrlConstant.Category.DELETE_CATEGORY)
  async deleteCategory(@Param('id') id: string) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.categoryService.deleteCategory(Number(id)),
    );
  }
}
