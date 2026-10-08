import { Injectable } from '@nestjs/common';

import { Role } from 'src/modules/roles/entities/role.entity';
import { RoleDto } from 'src/modules/roles/dto/response/role.dto';
import { PermissionMapper } from 'src/modules/permissions/mapper/permission.mapper';

@Injectable()
export class RoleMapper {
  constructor(
    private readonly permissionMapper: PermissionMapper,
  ) {}

  async toDto(role: Role): Promise<RoleDto> {
    const dto = new RoleDto();

    dto.id = role.id;
    dto.name = role.name ?? null;
    dto.description = role.description ?? null;
    dto.activeFlag = role.activeFlag;

    const permissions = await role.permissions;

    dto.permissions = permissions
      ? this.permissionMapper.toDtoList(permissions)
      : [];

    return dto;
  }

  async toDtos(roles: Role[]): Promise<RoleDto[]> {
    return Promise.all(
      roles.map((role) => this.toDto(role)),
    );
  }
}
