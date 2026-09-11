import {
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserDateAuditing } from '../../../common/entities/user-date-auditing.entity';

import { Role } from '../../roles/entities/role.entity';

@Entity('tbl_permissions')
export class Permission extends UserDateAuditing {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
  })
  id: number;

  @Column({
    name: 'name',
    nullable: true,
  })
  name: string | null;

  @Column({
    name: 'apiPath',
    nullable: true,
  })
  apiPath: string | null;

  @Column({
    name: 'method',
    nullable: true,
  })
  method: string | null;

  @Column({
    name: 'module',
    nullable: true,
  })
  module: string | null;

  @ManyToMany(
    () => Role,
    (role) => role.permissions,
  )
  roles: Role[];

  constructor(
    name?: string,
    apiPath?: string,
    method?: string,
    module?: string,
  ) {
    super();

    this.name = name ?? null;
    this.apiPath = apiPath ?? null;
    this.method = method ?? null;
    this.module = module ?? null;
  }
}
