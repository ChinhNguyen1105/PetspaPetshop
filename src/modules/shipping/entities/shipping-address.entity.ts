import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserDateAuditing } from '../../../common/entities/user-date-auditing.entity';

import { User } from '../../users/entities/user.entity';

@Entity('tbl_shipping_addresses')
export class ShippingAddress extends UserDateAuditing {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
  })
  id: number;

  @Column({
    name: 'fullName',
    nullable: false,
  })
  fullName: string;

  @Column({
    name: 'phone',
    nullable: false,
  })
  phone: string;

  @Column({
    name: 'addressDetail',
    nullable: false,
  })
  addressDetail: string;

  @Column({
    name: 'ward',
    nullable: false,
  })
  ward: string;

  @Column({
    name: 'district',
    nullable: false,
  })
  district: string;

  @Column({
    name: 'province',
    nullable: false,
  })
  province: string;

  @Column({
    name: 'is_default',
    nullable: true,
    default: false,
  })
  isDefault: boolean;

  @ManyToOne(
    () => User,
    (user) => user.shippingAddresses,
  )
  @JoinColumn({
    name: 'user_id',
  })
  user: User;
}
