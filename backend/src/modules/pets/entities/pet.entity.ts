import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { FlagUserDateAuditing } from '../../../common/entities/flag-user-date-auditing.entity';
import { GenderEnum } from '../../../common/constants/gender.enum';

import { User } from '../../users/entities/user.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('tbl_pets')
export class Pet extends FlagUserDateAuditing {
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
    name: 'specie',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  specie: string | null;

  @Column({
    name: 'gender',
    type: 'enum',
    enum: GenderEnum,
    nullable: true,
  })
  gender: GenderEnum | null;

  @Column({
    name: 'birthday',
    type: 'date',
    nullable: true,
  })
  birthday: Date | null;

  @Column({
    name: 'weight',
    type: 'float',
    nullable: true,
  })
  weight: number;

  @Column({
    name: 'health_status',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  healthStatus: string | null;

  @ManyToOne(() => User, (user) => user.pets)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @OneToMany(() => Booking, (booking) => booking.pet)
  bookings: Booking[];
}
