import {
  IsDefined,
} from 'class-validator';

export class ReqSetThumbnailProductDto {
  @IsDefined({ message: 'Product ID is required' })
  productId: number;

  @IsDefined({ message: 'Image ID is required' })
  imageId: number;
}
