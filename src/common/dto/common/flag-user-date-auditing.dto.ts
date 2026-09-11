import {
  IsBoolean,
  IsOptional,
} from 'class-validator';

import { UserDateAuditingDto } from './user-date-auditing.dto';

export abstract class FlagUserDateAuditingDto extends UserDateAuditingDto {
  @IsOptional()
  @IsBoolean()
  deleteFlag: boolean = false;

  @IsOptional()
  @IsBoolean()
  activeFlag: boolean = true;
}
