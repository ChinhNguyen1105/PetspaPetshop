import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';
import { ReqSetThumbnailProductDto } from 'src/modules/catalogue/products/dto/request/req-set-thumbnail-product.dto';
import { ProductImageDto } from 'src/modules/catalogue/products/dto/response/product-image.dto';

export interface ProductImageService {
  addImages(
    productId: number,
    files: Express.Multer.File[],
  ): Promise<CommonResponseDto>;

  deleteImage(imageId: number): Promise<CommonResponseDto>;

  changeMainImage(
    reqSetMainImage: ReqSetThumbnailProductDto,
  ): Promise<CommonResponseDto>;

  getProductImages(productId: number): Promise<ProductImageDto[]>;
}
