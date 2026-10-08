import { GenderEnum } from 'src/common/constants/gender.enum';
import { FlagUserDateAuditingDto } from 'src/common/dto/common/flag-user-date-auditing.dto';

export class UserDto extends FlagUserDateAuditingDto {
  id: string;

  name: string | null;

  email: string | null;

  dateOfBirth: Date | null;

  gender: GenderEnum | null;

  avatarUrl: string | null;

  roleName?: string | null;
}
