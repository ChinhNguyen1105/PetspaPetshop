import {
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsOptional,
  IsDate,
} from 'class-validator';

import { GenderEnum } from 'src/common/constants/gender.enum';
import { EnumValue } from 'src/common/validators/enum-value.decorator';

export class ReqCreatePetDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Species is required' })
  @IsString()
  specie: string;

  @IsDefined({ message: 'Gender is required' })
  @IsString()
  @EnumValue(GenderEnum)
  gender: string;

  @IsDefined({ message: 'Birthday is required' })
  @IsDate()
  birthday: Date;

  @IsDefined({ message: 'Weight is required' })
  @IsNumber()
  @IsPositive({ message: 'Weight must be a positive number' })
  weight: number;

  @IsOptional()
  @IsString()
  healthStatus: string | null;
}
