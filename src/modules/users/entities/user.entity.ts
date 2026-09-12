import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

import { FlagUserDateAuditing } from '../../../common/entities/flag-user-date-auditing.entity';

import { GenderEnum } from '../../../common/constants/gender.enum';

import { Pet } from '../../pets/entities/pet.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Order } from '../../orders/entities/order.entity';
import { Role } from '../../roles/entities/role.entity';
import { ShippingAddress } from '../../shipping/entities/shipping-address.entity';
import { ProductReview } from '../../reviews/entities/product-review.entity';
import { PetServiceReview } from '../../reviews/entities/pet-service-review.entity';
import { Cart } from '../../cart/entities/cart.entity';

@Entity('tbl_users')
export class User extends FlagUserDateAuditing {
  @PrimaryColumn({
    name: 'id',
    type: 'varchar',
    length: 255,
    nullable: false,
    update: false,
  })
  id: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  name: string | null;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  email: string | null;

  @Column({
    name: 'password',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  password: string | null;

  @Column({
    name: 'date_of_birth',
    type: 'date',
    nullable: true,
  })
  dateOfBirth: Date | null;

  @Column({
    name: 'gender',
    type: 'enum',
    enum: GenderEnum,
    nullable: true,
  })
  gender: GenderEnum | null;

  @Column({
    name: 'refresh_token',
    type: 'text',
    nullable: true,
  })
  refreshToken: string | null;

  @OneToMany(() => Pet, (pet) => pet.user, {
    lazy: false,
  })
  pets: Pet[];

  @OneToMany(() => Booking, (booking) => booking.user, {
    lazy: false,
  })
  bookings: Booking[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({
    name: 'role_id',
  })
  role: Role;

  @OneToMany(() => ShippingAddress, (shippingAddress) => shippingAddress.user)
  shippingAddresses: ShippingAddress[];

  @OneToMany(() => ProductReview, (review) => review.user)
  reviews: ProductReview[];

  @OneToMany(() => PetServiceReview, (review) => review.user)
  petServiceReviews: PetServiceReview[];

  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;

  @Column({
    name: 'avatar_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  avatarUrl: string | null;
}
