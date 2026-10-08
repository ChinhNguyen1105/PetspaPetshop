import { PermissionDto } from 'src/modules/permissions/dto/response/permission.dto';

export class RoleDto {
  id: number;

  name: string | null;

  description: string | null;

  activeFlag: boolean;

  permissions: PermissionDto[];
}
