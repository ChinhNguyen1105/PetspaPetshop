import {
  IsDefined,
  IsInt,
  Min,
} from 'class-validator';

export class ReqAddCartItemDto {
  @IsDefined({ message: 'Product ID is required' })
  productId: number;

  @IsDefined({ message: 'Quantity is required' })
  @IsInt()
  @Min(1, { message: 'Quantity must be greater than 0' })
  quantity: number;
}
