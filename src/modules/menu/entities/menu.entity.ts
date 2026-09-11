import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { FlagUserDateAuditing } from '../../../common/entities/flag-user-date-auditing.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('tbl_menus')
export class Menu extends FlagUserDateAuditing {
  @PrimaryGeneratedColumn({
    name: 'id',
  })
  id: number;

  @Column({
    name: 'name',
    nullable: true,
  })
  name: string | null;

  @Column({
    name: 'path',
    nullable: true,
  })
  path: string | null;

  @Column({
    name: 'icon',
    nullable: true,
  })
  icon: string | null;

  @Column({
    name: 'sortOrder',
    nullable: true,
  })
  sortOrder: number | null;

  @ManyToOne(
    () => Menu,
    (menu) => menu.children,
  )
  @JoinColumn({
    name: 'parent_id',
  })
  parent: Menu | null;

  @OneToMany(
    () => Menu,
    (menu) => menu.parent,
    {
      cascade: true,
    },
  )
  children: Menu[];

  @ManyToMany(
    () => Role,
    (role) => role.menus,
  )
  @JoinTable({
    name: 'menu_roles',
    joinColumn: {
      name: 'menu_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];
}
