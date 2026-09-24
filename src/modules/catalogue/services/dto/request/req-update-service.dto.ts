
import {
  IsDefined,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class ReqUpdateServiceDto {
  @IsDefined({ message: 'Service ID is required' })
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  name: string | null;

  @IsOptional()
  @IsString()
  description: string | null;

  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'Base price must be positive' })
  basePrice: number | null;

  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'Duration must be positive' })
  durationMin: number | null;

  @IsOptional()
  @IsNumber()
  categoryId: number | null;
}

