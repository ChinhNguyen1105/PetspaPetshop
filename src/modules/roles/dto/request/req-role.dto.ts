import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

import { Permission } from 'src/modules/permissions/entities/permission.entity';

export class ReqRoleDto {
  @IsNotEmpty({ message: 'Tên Role không được để trống!' })
  @IsString()
  @Matches(/^ROLE_[A-Z0-String_]+$/, {
    message: "Tên Role phải bắt đầu bằng cụm 'ROLE_' và viết hoa (Ví dụ: ROLE_ADMIN, ROLE_MANAGER)",
  })
  name: string;

  @IsOptional()
  @IsString()
  description: string | null;

  permissions: Permission[];
}
