import { FlagUserDateAuditingDto } from 'src/common/dto/common/flag-user-date-auditing.dto';

export class MenuDto extends FlagUserDateAuditingDto {
  id: number;

  name: string | null;

  path: string | null;

  icon: string | null;

  sortOrder: number | null;

  children: MenuDto[];

  roles: string[];
}
