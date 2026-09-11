import {
  IsDefined,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class ReqInventoryProductDto {
  @IsDefined({ message: 'Product ID is required' })
  productId: number;

  @IsDefined({ message: 'Quantity is required' })
  quantity: number;

  @IsNotEmpty({ message: 'Note is required' })
  @IsString()
  note: string;
}
