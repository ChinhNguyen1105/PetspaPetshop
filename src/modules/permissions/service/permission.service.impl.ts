import { Injectable } from '@nestjs/common';

import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';
import { ConflictException } from 'src/common/exceptions/conflict.exception';
import { FilterProcessor } from 'src/common/specification/filter-processor';
import { SpecificationBuilder } from 'src/common/specification/specification-builder';
import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { PermissionMapper } from 'src/modules/permissions/mapper/permission.mapper';
import { PermissionRepository } from 'src/modules/permissions/repositories/permission.repository';
import { PermissionService } from 'src/modules/permissions/service/permission.service';

@Injectable()
export class PermissionServiceImpl implements PermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly permissionMapper: PermissionMapper,
  ) {}

  private async checkValidExistPermission(
    apiPath: string,
    method: string,
    module: string,
  ): Promise<void> {
    const exists =
      await this.permissionRepository
        .existsByApiPathIgnoreCaseAndMethodIgnoreCaseAndModuleIgnoreCase(
          apiPath,
          method,
          module,
        );

    if (exists) {
      throw new ConflictException(
        'Permission already exists!',
      );
    }
  }

  async createPermission(
    permission: Permission,
  ) {
    await this.checkValidExistPermission(
      permission.apiPath as string,
      permission.method as string,
      permission.module as string,
    );

    const savedPermission =
      await this.permissionRepository
        .getRepository()
        .save(permission);

    return this.permissionMapper.toDto(
      savedPermission,
    );
  }

  async updatePermission(
    permission: Permission,
  ) {
    const permissionRepository =
      this.permissionRepository.getRepository();

    const permissionDb =
      await permissionRepository.findOne({
        where: {
          id: permission.id,
        },
      });

    if (!permissionDb) {
      throw new ConflictException(
        `Permission with id = ${permission.id} not found!`,
      );
    }

    await this.checkValidExistPermission(
      permission.apiPath as string,
      permission.method as string,
      permission.module as string,
    );

    permissionDb.name = permission.name;
    permissionDb.apiPath = permission.apiPath;
    permissionDb.method = permission.method;
    permissionDb.module = permission.module;

    const savedPermission =
      await permissionRepository.save(permissionDb);

    return this.permissionMapper.toDto(
      savedPermission,
    );
  }

  async deletePermission(
    id: number,
  ): Promise<void> {
    const permissionRepository =
      this.permissionRepository.getRepository();

    const permissionDb =
      await permissionRepository.findOne({
        where: {
          id,
        },
        relations: {
          roles: true,
        },
      });

    if (!permissionDb) {
      throw new ConflictException(
        `Permission with id = ${id} not found!`,
      );
    }

    if (permissionDb.roles) {
      for (const role of permissionDb.roles) {
        const permissions =
          await role.permissions;

        if (permissions) {
          role.permissions =
            Promise.resolve(
              permissions.filter(
                (permissionItem) =>
                  permissionItem.id !== permissionDb.id,
              ),
            );
        }
      }
    }

    await permissionRepository.remove(
      permissionDb,
    );
  }

  async fetchAllPermission(
    filter: string[],
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto> {
    const specificationBuilder =
      new SpecificationBuilder<Permission>();

    FilterProcessor.process(
      specificationBuilder,
      filter,
    );

    const queryBuilder =
      this.permissionRepository
        .getRepository()
        .createQueryBuilder('permission');

    specificationBuilder.apply(
      queryBuilder,
      'permission',
    );

    const [
      permissions,
      total,
    ] = await queryBuilder
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
      this.permissionMapper.toDtoList(
        permissions,
      );

    return result;
  }

  async fetchAPermission(
    id: number,
  ) {
    const permission =
      await this.permissionRepository
        .getRepository()
        .findOne({
          where: {
            id,
          },
        });

    if (!permission) {
      throw new ConflictException(
        `Permission with id = ${id} not found!`,
      );
    }

    return this.permissionMapper.toDto(
      permission,
    );
  }
}
