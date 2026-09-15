import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';

import { ReqPermissionDto } from 'src/modules/permissions/dto/request/req-permission.dto';
import { ReqUpdatePermissionDto } from 'src/modules/permissions/dto/request/req-update-permission.dto';
import { PermissionDto } from 'src/modules/permissions/dto/response/permission.dto';
import { Permission } from 'src/modules/permissions/entities/permission.entity';

export interface PermissionService {
  createPermission(
    permission: ReqPermissionDto,
  ): Promise<PermissionDto>;

  updatePermission(
    permission: ReqUpdatePermissionDto,
  ): Promise<PermissionDto>;

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
