import {
  IsString,
  IsDateString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';

export class CreatePetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  species: string; // dog, cat, rabbit, etc.

  @IsString()
  @IsOptional()
  breed?: string;

  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  color?: string;
}

export class UpdatePetDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  species?: string;

  @IsString()
  @IsOptional()
  breed?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  color?: string;
}

export class PetResponseDto {
  id: string;
  name: string;
  species: string;
  breed: string;
  dateOfBirth: string;
  weight: number;
  color: string;
  avatar: string;
  status: string;
}
