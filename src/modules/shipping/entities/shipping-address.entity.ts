import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserDateAuditing } from 'src/common/entities/user-date-auditing.entity';

import { User } from 'src/modules/users/entities/user.entity';

@Entity('tbl_shipping_addresses')
export class ShippingAddress extends UserDateAuditing {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
  })
  id: number;

  @Column({
    name: 'full_name',
    nullable: false,
  })
  fullName: string;

  @Column({
    name: 'phone',
    nullable: false,
  })
  phone: string;

  @Column({
    name: 'address_detail',
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

  @ManyToOne(() => User, (user) => user.shippingAddresses)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;
}
