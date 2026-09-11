import {
  IsOptional,
  IsString,
} from 'class-validator';

import { GenderEnum } from 'src/common/constants/gender.enum';
import { EnumValue } from 'src/common/validators/enum-value.decorator';

export class ReqUserUpdateProfileDto {
  @IsOptional()
  @IsString()
  name: string | null;

  @IsOptional()
  dateOfBirth: Date | null;

  @IsOptional()
  @IsString()
  @EnumValue(GenderEnum)
  gender: string | null;
}
