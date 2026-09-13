import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { join } from 'path';

import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';

import { ReqSetThumbnailProductDto } from 'src/modules/catalogue/products/dto/request/req-set-thumbnail-product.dto';
import { ProductImageDto } from 'src/modules/catalogue/products/dto/response/product-image.dto';

import { Product } from 'src/modules/catalogue/products/entities/product.entity';
import { ProductImage } from 'src/modules/catalogue/products/entities/product-image.entity';

import { ProductImageRepository } from 'src/modules/catalogue/products/repositories/product-image.repository';
import { ProductRepository } from 'src/modules/catalogue/products/repositories/product.repository';

import type { FileService } from 'src/modules/files/service/file.service';

import { ProductImageService } from 'src/modules/catalogue/products/service/product-image.service';
import { Inject } from '@nestjs/common';
import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';
@Injectable()
export class ProductImageServiceImpl implements ProductImageService {
  private readonly logger = new Logger(ProductImageServiceImpl.name);

  constructor(
    @Inject(PROVIDER_TOKEN.FILE_SERVICE)
    private readonly fileService: FileService,
    private readonly productRepository: ProductRepository,
    private readonly productImageRepository: ProductImageRepository,
    private readonly configService: ConfigService,
  ) {}

  async addImages(
    productId: number,
    files: Express.Multer.File[],
  ): Promise<CommonResponseDto> {
    const product = await this.productRepository.getRepository().findOne({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product not found with id: ${productId}`);
    }

    const uploadFileResultDto = await this.fileService.uploadListFile(
      files,
      'products',
    );

    if (
      uploadFileResultDto.resUploadFileDtoList != null &&
      uploadFileResultDto.resUploadFileDtoList.length > 0
    ) {
      const images = uploadFileResultDto.resUploadFileDtoList.map(
        (resUploadFileDto) => {
          const productImage = new ProductImage();

          productImage.product = product;
          productImage.imageUrl = resUploadFileDto.fileName;

          return productImage;
        },
      );

      await this.productImageRepository.getRepository().save(images);

      this.logger.log(
        `[PRODUCT_IMAGE] Đã thêm ${images.length} ảnh cho Product ID: ${productId}`,
      );

      return {
        status: true,
        message: 'Thêm ảnh sản phẩm thành công',
      };
    }

    return {
      status: false,
      message: 'Không có ảnh nào được thêm (file lỗi hoặc trống',
    };
  }

  async deleteImage(imageId: number): Promise<CommonResponseDto> {
    const productImage = await this.productImageRepository
      .getRepository()
      .findOne({
        where: {
          id: imageId,
        },
        relations: {
          product: true,
        },
      });

    if (!productImage) {
      throw new NotFoundException(
        `Product image not found with id: ${imageId}`,
      );
    }

    const baseUri = this.configService.get<string>(
      'hoang.upload-file.base-uri',
    );

    if (baseUri) {
      try {
        const filePath = join(baseUri, 'products', productImage.imageUrl ?? '');

        await fs.unlink(filePath);

        this.logger.log(
          `[PRODUCT_IMAGE] Xóa file vật lý thành công: ${filePath}`,
        );
      } catch (error) {
        if (
          error instanceof Error &&
          'code' in error &&
          error.code === 'ENOENT'
        ) {
          this.logger.warn(
            `[PRODUCT_IMAGE] File vật lý không tồn tại, tiếp tục xóa DB | Image ID: ${imageId}`,
          );
        } else {
          this.logger.error(
            `[PRODUCT_IMAGE] Lỗi khi xóa file vật lý | Image ID: ${imageId}`,
            error instanceof Error ? error.stack : undefined,
          );
        }
      }
    }

    await this.productImageRepository.getRepository().remove(productImage);

    return {
      status: true,
      message: 'Xóa ảnh sản phẩm thành công',
    };
  }

  async changeMainImage(
    reqSetMainImage: ReqSetThumbnailProductDto,
  ): Promise<CommonResponseDto> {
    const productExists = await this.productRepository.getRepository().exists({
      where: {
        id: reqSetMainImage.productId,
      },
    });

    if (!productExists) {
      throw new NotFoundException(
        `Product not found with id: ${reqSetMainImage.productId}`,
      );
    }

    const targetImage = await this.productImageRepository
      .getRepository()
      .findOne({
        where: {
          id: reqSetMainImage.imageId,
        },
        relations: {
          product: true,
        },
      });

    if (!targetImage) {
      throw new NotFoundException(
        `Product image not found with id: ${reqSetMainImage.imageId}`,
      );
    }

    if (targetImage.product?.id !== reqSetMainImage.productId) {
      return {
        status: false,
        message: 'Ảnh không thuộc về sản phẩm này',
      };
    }

    await this.productImageRepository.resetMainImageByProductId(
      reqSetMainImage.productId,
    );

    targetImage.isThumbnail = true;

    await this.productImageRepository.getRepository().save(targetImage);

    return {
      status: true,
      message: 'Thay đổi ảnh đại diện sản phẩm thành công',
    };
  }

  async getProductImages(productId: number): Promise<ProductImageDto[]> {
    const product =
      await this.productRepository.findByIdAndDeleteFlagFalse(productId);

    if (!product) {
      throw new NotFoundException(`Product not found with id: ${productId}`);
    }

    const images = await this.productImageRepository.findByProductId(productId);

    return images.map((image) => ({
      id: image.id,
      imageUrl: image.imageUrl ?? '',
      isThumbnail: image.isThumbnail,
      productId: image.product?.id ?? productId,
    }));
  }
}
