import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Permission } from 'src/modules/permissions/entities/permission.entity';

@Injectable()
export class PermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly repository: Repository<Permission>,
  ) {}

  existsByApiPathIgnoreCaseAndMethodIgnoreCaseAndModuleIgnoreCase(
    apiPath: string,
    method: string,
    module: string,
  ) {
    return this.repository
      .createQueryBuilder('permission')
      .where('LOWER(permission.apiPath) = LOWER(:apiPath)', { apiPath })
      .andWhere('LOWER(permission.method) = LOWER(:method)', { method })
      .andWhere('LOWER(permission.module) = LOWER(:module)', { module })
      .getExists();
  }

  findByApiPathAndMethod(
    apiPath: string,
    method: string,
  ): Promise<Permission | null> {
    return this.repository
      .createQueryBuilder('permission')
      .where('LOWER(permission.apiPath) = LOWER(:apiPath)', { apiPath })
      .andWhere('LOWER(permission.method) = LOWER(:method)', { method })
      .getOne();
  }

  findByIdIn(ids: number[]) {
    return this.repository
      .createQueryBuilder('permission')
      .where('permission.id IN (:...ids)', { ids })
      .getMany();
  }

  getRepository(): Repository<Permission> {
    return this.repository;
  }
}
