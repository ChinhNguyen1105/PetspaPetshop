import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';
import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { PermissionDto } from 'src/modules/permissions/dto/response/permission.dto';

export interface PermissionService {
  createPermission(permission: Permission): Promise<PermissionDto>;

  updatePermission(permission: Permission): Promise<PermissionDto>;

  deletePermission(id: number): Promise<void>;

  fetchAllPermission(
    filter: string[],
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto>;

  fetchAPermission(id: number): Promise<PermissionDto>;

  findByApiPathAndMethod(
    apiPath: string,
    method: string,
  ): Promise<Permission | null>;
}
