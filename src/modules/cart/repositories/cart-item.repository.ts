import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CartItem } from 'src/modules/cart/entities/cart-item.entity';

@Injectable()
export class CartItemRepository {
  constructor(
    @InjectRepository(CartItem)
    private readonly repository: Repository<CartItem>,
  ) {}

  findByCartIdAndProductId(cartId: number, productId: number) {
    return this.repository
      .createQueryBuilder('cartItem')
      .leftJoinAndSelect('cartItem.cart', 'cart')
      .leftJoinAndSelect('cartItem.product', 'product')
      .where('cart.id = :cartId', { cartId })
      .andWhere('product.id = :productId', { productId })
      .getOne();
  }

  getRepository(): Repository<CartItem> {
    return this.repository;
  }
}
