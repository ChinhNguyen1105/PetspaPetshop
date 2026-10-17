import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsOptional
} from 'class-validator';

export class ReqUpdateProductDto {
  @IsDefined({ message: 'Product ID is required' })
  id: number;

  @IsNotEmpty({ message: 'Product name is required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Product description is required' })
  @IsString()
  description: string;

  @IsDefined({ message: 'Product price is required' })
  price: number;

  @IsDefined({ message: 'Category ID is required' })
  categoryId: number;

  @IsOptional()
  @IsDefined({ message: 'Quantity is required' })
  quantity: number;
}
