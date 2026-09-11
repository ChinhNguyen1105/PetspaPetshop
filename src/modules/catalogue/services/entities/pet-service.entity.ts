import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { FlagUserDateAuditing } from '../../../../common/entities/flag-user-date-auditing.entity';

import { BookingDetail } from '../../../bookings/entities/booking-detail.entity';
import { Category } from '../../categories/entities/category.entity';
import { PetServiceImage } from './pet-service-image.entity';

@Entity('tbl_services')
export class PetService extends FlagUserDateAuditing {
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

  @Column({
    name: 'base_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  basePrice: number | null;

  @Column({
    name: 'duration_min',
    type: 'int',
    nullable: false,
  })
  durationMin: number;

  @OneToMany(
    () => BookingDetail,
    (bookingDetail) => bookingDetail.service,
  )
  bookingDetails: BookingDetail[];

  @ManyToOne(
    () => Category,
    (category) => category.petServices,
  )
  @JoinColumn({
    name: 'category_id',
  })
  category: Category;

  @OneToMany(
    () => PetServiceImage,
    (serviceImage) => serviceImage.petService,
  )
  serviceImages: PetServiceImage[];
}
