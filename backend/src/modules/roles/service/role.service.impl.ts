import { Injectable } from '@nestjs/common';

import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';
import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';
import { BadRequestException } from 'src/common/exceptions/bad-request.exception';
import { FilterProcessor } from 'src/common/specification/filter-processor';
import { SpecificationBuilder } from 'src/common/specification/specification-builder';
import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { PermissionMapper } from 'src/modules/permissions/mapper/permission.mapper';
import { PermissionRepository } from 'src/modules/permissions/repositories/permission.repository';
import { Role } from 'src/modules/roles/entities/role.entity';
import { RoleMapper } from 'src/modules/roles/mapper/role.mapper';
import { RoleRepository } from 'src/modules/roles/repositories/role.repository';
import { RoleService } from 'src/modules/roles/service/role.service';

@Injectable()
export class RoleServiceImpl implements RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly roleMapper: RoleMapper,
    private readonly permissionMapper: PermissionMapper,
  ) {}

  private async checkValidRoleName(
    name: string,
  ): Promise<void> {
    const exists =
      await this.roleRepository
        .existsByNameAndDeleteFlagFalse(name);

    if (exists) {
      throw new BadRequestException(
        `Role with name = ${name} already exists!`,
      );
    }
  }

  private async convertPermissionExist(
    permissions: Permission[] | null,
  ): Promise<Permission[]> {
    if (!permissions || permissions.length === 0) {
      return [];
    }

    const ids = permissions.map(
      (permission) => permission.id,
    );

    return this.permissionRepository.findByIdIn(ids);
  }

  async createRole(role: Role) {
    await this.checkValidRoleName(
      role.name as string,
    );

    const permissionExistList =
      await this.convertPermissionExist(
        role.permissions
          ? await role.permissions
          : [],
      );

    role.permissions =
      Promise.resolve(permissionExistList);

    const savedRole =
      await this.roleRepository
        .getRepository()
        .save(role);

    return this.roleMapper.toDto(savedRole);
  }

  async updateRole(role: Role) {
    if (
      role.id === null ||
      role.id === undefined
    ) {
      throw new BadRequestException(
        'Role id is required!',
      );
    }

    const roleDb =
      await this.getRoleById(role.id);

    if (role.name !== roleDb.name) {
      await this.checkValidRoleName(
        role.name as string,
      );
    }

    const permissionExistList =
      await this.convertPermissionExist(
        role.permissions
          ? await role.permissions
          : [],
      );

    roleDb.name = role.name;
    roleDb.description = role.description;
    roleDb.activeFlag = role.activeFlag;
    roleDb.permissions =
      Promise.resolve(permissionExistList);

    const savedRole =
      await this.roleRepository
        .getRepository()
        .save(roleDb);

    return this.roleMapper.toDto(savedRole);
  }

  async deleteRole(
    id: number,
  ): Promise<CommonResponseDto> {
    const role =
      await this.roleRepository
        .findByIdAndDeleteFlagFalse(id);

    if (!role) {
      throw new BadRequestException(
        `Role with id = ${id} not found!`,
      );
    }

    role.deleteFlag = true;

    await this.roleRepository
      .getRepository()
      .save(role);

    return {
      status: true,
      message: 'Role deleted successfully!',
    };
  }

  async fetchAllRole(
    filter: string[],
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto> {
    const specificationBuilder =
      new SpecificationBuilder<Role>();

    FilterProcessor.process(
      specificationBuilder,
      filter,
    );

    const queryBuilder =
      this.roleRepository
        .getRepository()
        .createQueryBuilder('role')
        .where(
          'role.deleteFlag = :deleteFlag',
          {
            deleteFlag: false,
          },
        );

    specificationBuilder.apply(
      queryBuilder,
      'role',
    );

    const [roles, total] =
      await queryBuilder
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getManyAndCount();

    const result =
      new ResultPaginationDto();

    result.meta = {
      page,
      pageSize,
      pages: Math.ceil(
        total / pageSize,
      ),
      total,
    };

    result.result =
      await this.roleMapper.toDtos(roles);

    return result;
  }

  async fetchARole(id: number) {
    const role =
      await this.roleRepository
        .getRepository()
        .findOne({
          where: {
            id,
          },
          relations: {
            permissions: true,
          },
        });

    if (!role) {
      throw new BadRequestException(
        `Role with id = ${id} not found!`,
      );
    }

    return this.roleMapper.toDto(role);
  }

  async getRoleById(
    id: number,
  ): Promise<Role> {
    const role =
      await this.roleRepository
        .getRepository()
        .findOne({
          where: {
            id,
          },
          relations: {
            permissions: true,
          },
        });

    if (!role) {
      throw new BadRequestException(
        `Role with id = ${id} not found!`,
      );
    }

    return role;
  }
}
