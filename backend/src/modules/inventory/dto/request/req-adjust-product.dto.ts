import {
  IsDefined,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class ReqAdjustProductDto {
  @IsDefined({ message: 'Product ID is required' })
  productId: number;

  @IsDefined({ message: 'New quantity is required' })
  newQuantity: number;

  @IsNotEmpty({ message: 'Note is required' })
  @IsString()
  note: string;
}
