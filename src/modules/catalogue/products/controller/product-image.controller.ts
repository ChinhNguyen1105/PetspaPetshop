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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import { VsResponseUtil } from 'src/common/base/vs-response.util';
import { UrlConstant } from 'src/common/constants/url.constant';
import { ReqSetThumbnailProductDto } from 'src/modules/catalogue/products/dto/request/req-set-thumbnail-product.dto';
import type { ProductImageService } from 'src/modules/catalogue/products/service/product-image.service';

@RestApiV1()
@Controller()
export class ProductImageController {
  constructor(
    private readonly productImageService: ProductImageService,
  ) {}

  @Post(UrlConstant.ProductImages.ADD_IMAGES)
  @UseInterceptors(
    FilesInterceptor('files'),
  )
  async addImages(
    @Query('productId') productId: number,
    @UploadedFiles()
    files: Express.Multer.File[],
  ) {
    const commonResponseDto =
      await this.productImageService.addImages(
        Number(productId),
        files,
      );

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      commonResponseDto,
    );
  }

  @Delete(
    UrlConstant.ProductImages.DELETE_IMAGE.replace(
      '{id}',
      ':id',
    ),
  )
  async deleteImage(
    @Param('id') imageId: number,
  ) {
    const commonResponseDto =
      await this.productImageService.deleteImage(
        imageId,
      );

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      commonResponseDto,
    );
  }

  @Put(
    UrlConstant.ProductImages.SET_MAIN_IMAGE,
  )
  async changeMainImage(
    @Body()
    reqSetMainImage: ReqSetThumbnailProductDto,
  ) {
    const response =
      await this.productImageService.changeMainImage(
        reqSetMainImage,
      );

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      response,
    );
  }

  @Get(
    UrlConstant.ProductImages.GET_IMAGES.replace(
      '{productId}',
      ':productId',
    ),
  )
  async getImages(
    @Param('productId') productId: number,
  ) {
    const images =
      await this.productImageService.getProductImages(
        productId,
      );

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      images,
    );
  }
}
