import {
  IsDefined,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class ReqCreateProductDto {
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

  @IsDefined({ message: 'Quantity is required' })
  quantity: number;
}
