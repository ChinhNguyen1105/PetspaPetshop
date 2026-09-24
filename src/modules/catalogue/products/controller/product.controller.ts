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

import { VsResponseUtil } from 'src/common/base/vs-response.util';
import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';
import { UrlConstant } from 'src/common/constants/url.constant';
import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';

import { ProductQueryDto } from 'src/modules/catalogue/products/dto/request/product-query.dto';
import { ReqCreateProductDto } from 'src/modules/catalogue/products/dto/request/req-create-product.dto';
import { ReqUpdateProductDto } from 'src/modules/catalogue/products/dto/request/req-update-product.dto';

import { ReqRecommendationDto } from 'src/modules/recommendation/dto/request/req-recommendation.dto';
import { ResRecommendationDto } from 'src/modules/recommendation/dto/response/res-recommendation.dto';

import type { ProductService } from 'src/modules/catalogue/products/service/product.service';

@RestApiV1()
@Controller()
export class ProductController {
  constructor(
    @Inject(PROVIDER_TOKEN.PRODUCT_SERVICE)
    private readonly productService: ProductService,
  ) {}

  @Get(UrlConstant.Product.GET_PRODUCT)
  async getProduct(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.productService.getProductById(id),
    );
  }

  @Post(UrlConstant.Product.CREATE_PRODUCT)
  async createProduct(
    @Body() reqCreateProduct: ReqCreateProductDto,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.productService.createProduct(
        reqCreateProduct,
      ),
    );
  }

  @Put(UrlConstant.Product.UPDATE_PRODUCT)
  async updateProduct(
    @Body() reqUpdateProduct: ReqUpdateProductDto,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.productService.updateProduct(
        reqUpdateProduct,
      ),
    );
  }

  @Delete(UrlConstant.Product.DELETE_PRODUCT)
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.productService.deleteProduct(id),
    );
  }

  @Get(UrlConstant.Product.GET_PRODUCTS)
  async getAllProduct(
    @Query() query: ProductQueryDto,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.productService.getAllProduct(query),
    );
  }

  @Post(UrlConstant.Product.GET_RECOMMENDATIONS)
  async recommendProducts(
    @Body() req: ReqRecommendationDto,
  ) {
    const recommendedItemIds =
      await this.productService.getRecommendedProductIds(
        req.itemIds,
      );

    const response = new ResRecommendationDto();

    response.recommendedItemIds = recommendedItemIds;

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      response,
    );
  }
}
