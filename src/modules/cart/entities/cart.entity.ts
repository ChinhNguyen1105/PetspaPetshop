import {
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { DateAuditing } from '../../../common/entities/date-auditing.entity';

import { User } from '../../users/entities/user.entity';
import { CartItem } from './cart-item.entity';

@Entity('tbl_carts')
export class Cart extends DateAuditing {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
  })
  id: number;

  @OneToOne(
    () => User,
    (user) => user.cart,
  )
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @OneToMany(
    () => CartItem,
    (cartItem) => cartItem.cart,
    {
      cascade: true,
    },
  )
  cartItems: CartItem[];
}
