import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { GenderEnum } from 'src/common/constants/gender.enum';
import { UserDateAuditingDto } from 'src/common/dto/common/user-date-auditing.dto';
import { EnumValue } from 'src/common/validators/enum-value.decorator';
import { Role } from 'src/modules/roles/entities/role.entity';

export class UserUpdateDto extends UserDateAuditingDto {
  @IsNotEmpty({
    message: 'User ID is required',
  })
  @IsString()
  id: string;

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
  @IsString()
  avatarUrl: string | null;

  @IsOptional()
  role: Role | null;
}
