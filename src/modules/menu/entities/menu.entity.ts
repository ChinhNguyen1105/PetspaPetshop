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
    type: 'bigint',
  })
  id: number;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  name: string | null;

  @Column({
    name: 'path',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  path: string | null;

  @Column({
    name: 'icon',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  icon: string | null;

  @Column({
    name: 'sortOrder',
    type: 'int',
    nullable: true,
  })
  sortOrder: number | null;

  @ManyToOne(() => Menu, (menu) => menu.children)
  @JoinColumn({
    name: 'parent_id',
  })
  parent: Menu | null;

  @OneToMany(() => Menu, (menu) => menu.parent, {
    cascade: true,
  })
  children: Menu[];

  @ManyToMany(() => Role, (role) => role.menus)
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
