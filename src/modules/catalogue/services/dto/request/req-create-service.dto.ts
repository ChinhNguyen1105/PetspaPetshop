import {
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class ReqCreateServiceDto {
  @IsNotEmpty({ message: 'Service name is required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Service description is required' })
  @IsString()
  description: string;

  @IsDefined({ message: 'Base price is required' })
  @IsNumber()
  @IsPositive({ message: 'Base price must be positive' })
  basePrice: number;

  @IsDefined({ message: 'Duration is required' })
  @IsNumber()
  @IsPositive({ message: 'Duration must be positive' })
  durationMin: number;

  @IsDefined({ message: 'Category ID is required' })
  categoryId: number;
}
