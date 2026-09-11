import { Injectable } from '@nestjs/common';

import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { PermissionDto } from 'src/modules/permissions/dto/response/permission.dto';

@Injectable()
export class PermissionMapper {
  toDto(permission: Permission): PermissionDto {
    const dto = new PermissionDto();

    dto.id = permission.id;
    dto.name = permission.name;
    dto.apiPath = permission.apiPath;
    dto.method = permission.method;
    dto.module = permission.module;

    return dto;
  }

  toDtoList(permissions: Permission[]): PermissionDto[] {
    return permissions.map((permission) => this.toDto(permission));
  }
}
