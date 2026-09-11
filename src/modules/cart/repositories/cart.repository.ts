import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cart } from 'src/modules/cart/entities/cart.entity';

@Injectable()
export class CartRepository {
  constructor(
    @InjectRepository(Cart)
    private readonly repository: Repository<Cart>,
  ) {}

  findByUserId(userId: string) {
    return this.repository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.user', 'user')
      .where('user.id = :userId', { userId })
      .getOne();
  }

  getRepository(): Repository<Cart> {
    return this.repository;
  }
}
