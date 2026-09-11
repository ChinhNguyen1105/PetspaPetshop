import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { FlagUserDateAuditing } from '../../../common/entities/flag-user-date-auditing.entity';

import { Permission } from '../../permissions/entities/permission.entity';
import { User } from '../../users/entities/user.entity';
import { Menu } from '../../menu/entities/menu.entity';

@Entity('tbl_roles')
export class Role extends FlagUserDateAuditing {
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
    name: 'description',
    nullable: true,
  })
  description: string | null;

  @ManyToMany(
    () => Permission,
    (permission) => permission.roles,
    {
      lazy: true,
    },
  )
  @JoinTable({
    name: 'tbl_permission_role',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: Promise<Permission[]>;

  @OneToMany(
    () => User,
    (user) => user.role,
    {
      lazy: true,
    },
  )
  users: Promise<User[]>;

  @ManyToMany(
    () => Menu,
    (menu) => menu.roles,
    {
      lazy: true,
    },
  )
  menus: Promise<Menu[]>;
}
