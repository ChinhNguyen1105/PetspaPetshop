import {
  IsOptional,
  IsString,
} from 'class-validator';

import { DateAuditing } from './date-auditing.dto';

export abstract class UserDateAuditingDto extends DateAuditing {
  @IsOptional()
  @IsString()
  createdBy: string | null;

  @IsOptional()
  @IsString()
  lastModifiedBy: string | null;
}
