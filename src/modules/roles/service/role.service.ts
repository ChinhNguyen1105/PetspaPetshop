import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';
import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';
import { RoleDto } from 'src/modules/roles/dto/response/role.dto';
import { Role } from 'src/modules/roles/entities/role.entity';

export interface RoleService {
  createRole(role: Role): Promise<RoleDto>;

  updateRole(role: Role): Promise<RoleDto>;

  deleteRole(id: number): Promise<CommonResponseDto>;

  fetchAllRole(
    filter: string[],
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto>;

  fetchARole(id: number): Promise<RoleDto>;

  getRoleById(id: number): Promise<Role>;
}
