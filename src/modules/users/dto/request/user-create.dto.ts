import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { GenderEnum } from 'src/common/constants/gender.enum';
import { EnumValue } from 'src/common/validators/enum-value.decorator';
import { FlagUserDateAuditingDto } from 'src/common/dto/common/flag-user-date-auditing.dto';
import { Role } from 'src/modules/roles/entities/role.entity';

export class UserCreateDto extends FlagUserDateAuditingDto {
  @IsNotEmpty({
    message: 'Email is required',
  })
  @IsString()
  email: string;

  @IsNotEmpty({
    message: 'Password is required',
  })
  @IsString()
  password: string;

  @IsNotEmpty({
    message: 'Name is required',
  })
  @IsString()
  name: string;

  @IsNotEmpty({
    message: 'Date of birth is required',
  })
  dateOfBirth: Date;

  @IsNotEmpty({
    message: 'Gender is required',
  })
  @EnumValue(GenderEnum)
  gender: string;

  @IsOptional()
  role: Role | null;
}
