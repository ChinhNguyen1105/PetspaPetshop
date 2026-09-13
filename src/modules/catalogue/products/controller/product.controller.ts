import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Inject,
} from '@nestjs/common';

import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import { VsResponseUtil } from 'src/common/base/vs-response.util';
import { UrlConstant } from 'src/common/constants/url.constant';
import { ReqRecommendationDto } from 'src/modules/recommendation/dto/request/req-recommendation.dto';
import { ResRecommendationDto } from 'src/modules/recommendation/dto/response/res-recommendation.dto';
import { ReqCreateProductDto } from 'src/modules/catalogue/products/dto/request/req-create-product.dto';
import { ReqUpdateProductDto } from 'src/modules/catalogue/products/dto/request/req-update-product.dto';
import type { ProductService } from 'src/modules/catalogue/products/service/product.service';
import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';
@RestApiV1()
@Controller()
export class ProductController {
  constructor(
    @Inject(PROVIDER_TOKEN.PRODUCT_SERVICE)
    private readonly productService: ProductService,
  ) {}

  @Get(UrlConstant.Product.GET_PRODUCT.replace('{id}', ':id'))
  async getProduct(@Param('id') id: number) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.productService.getProductById(id),
    );
  }

  @Post(UrlConstant.Product.CREATE_PRODUCT)
  async createProduct(@Body() reqCreateProduct: ReqCreateProductDto) {
    const productDto =
      await this.productService.createProduct(reqCreateProduct);

    return VsResponseUtil.successWithStatus(HttpStatus.OK, productDto);
  }

  @Put(UrlConstant.Product.UPDATE_PRODUCT)
  async updateProduct(@Body() reqUpdateProduct: ReqUpdateProductDto) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.productService.updateProduct(reqUpdateProduct),
    );
  }

  @Delete(UrlConstant.Product.DELETE_PRODUCT.replace('{id}', ':id'))
  async deleteProduct(@Param('id') id: number) {
    const commonResponseDto = await this.productService.deleteProduct(id);

    return VsResponseUtil.successWithStatus(HttpStatus.OK, commonResponseDto);
  }

  @Get(UrlConstant.Product.GET_PRODUCTS)
  async getAllProduct(
    @Query('filter') filter: string[] | undefined,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.productService.getAllProduct(
        filter ?? [],
        Number(page),
        Number(pageSize),
      ),
    );
  }

  @Post(UrlConstant.Product.GET_RECOMMENDATIONS)
  async recommendProducts(@Body() req: ReqRecommendationDto) {
    const recommendedItemIds =
      await this.productService.getRecommendedProductIds(req.itemIds);

    const response = new ResRecommendationDto();
    response.recommendedItemIds = recommendedItemIds;

    return VsResponseUtil.successWithStatus(HttpStatus.OK, response);
  }
}
