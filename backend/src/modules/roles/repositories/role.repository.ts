import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role } from 'src/modules/roles/entities/role.entity';

@Injectable()
export class RoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly repository: Repository<Role>,
  ) {}

  findByNameAndDeleteFlagFalse(name: string) {
    return this.repository
      .createQueryBuilder('role')
      .where('role.name = :name', { name })
      .andWhere('role.deleteFlag = false')
      .getOne();
  }

  existsByNameAndDeleteFlagFalse(name: string) {
    return this.repository
      .createQueryBuilder('role')
      .where('role.name = :name', { name })
      .andWhere('role.deleteFlag = false')
      .getExists();
  }

  findByIdAndDeleteFlagFalse(id: number) {
    return this.repository
      .createQueryBuilder('role')
      .where('role.id = :id', { id })
      .andWhere('role.deleteFlag = false')
      .getOne();
  }

  existsByIdAndDeleteFlagFalse(id: number) {
    return this.repository
      .createQueryBuilder('role')
      .where('role.id = :id', { id })
      .andWhere('role.deleteFlag = false')
      .getExists();
  }

  getRepository(): Repository<Role> {
    return this.repository;
  }
}
