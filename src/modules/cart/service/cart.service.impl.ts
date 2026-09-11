import { Injectable, Logger } from '@nestjs/common';
import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';

import { CartDto } from 'src/modules/cart/dto/response/cart.dto';
import { CartItemMapper } from 'src/modules/cart/mapper/cart-item.mapper';

import { CartRepository } from 'src/modules/cart/repositories/cart.repository';

import type { UserService } from 'src/modules/users/service/user.service';

import { CartService } from 'src/modules/cart/service/cart.service';

@Injectable()
export class CartServiceImpl implements CartService {
  private readonly logger = new Logger(
    CartServiceImpl.name,
  );

  constructor(
    private readonly cartRepository: CartRepository,
    private readonly userService: UserService,
    private readonly cartItemMapper: CartItemMapper,
  ) {}

  async getCart(): Promise<CartDto> {
    this.logger.log(
      '[CART] Xem giỏ hàng của user hiện tại',
    );

    const currentUser =
      await this.userService.getUserLogin();

    const cart =
      await this.cartRepository.findByUserId(
        currentUser.id,
      );

    if (!cart) {
      this.logger.log(
        `[CART] Giỏ hàng trống | User ID: ${currentUser.id}`,
      );

      return {
        totalItem: 0,
        totalAmount: 0,
        itemDtoList: [],
      } as CartDto;
    }

    const cartItems =
      (cart.cartItems ?? []).map(
        (cartItem) =>
          this.cartItemMapper.toDto(
            cartItem,
          ),
      );

    const totalAmount =
      cartItems.reduce(
        (sum, item) =>
          sum + Number(item.totalPrice ?? 0),
        0,
      );

    this.logger.log(
      `[CART] User ID: ${currentUser.id} | Số item: ${cartItems.length} | Tổng tiền: ${totalAmount}`,
    );

    return {
      id: cart.id,
      totalAmount,
      totalItem: cartItems.length,
      itemDtoList: cartItems,
    } as CartDto;
  }

  async deleteCart(): Promise<CommonResponseDto> {
    this.logger.log(
      '[CART] Xóa toàn bộ giỏ hàng',
    );

    const currentUser =
      await this.userService.getUserLogin();

    const cart =
      await this.cartRepository.findByUserId(
        currentUser.id,
      );

    if (!cart) {
      throw new NotFoundException(
        'Giỏ hàng không tồn tại',
      );
    }

    cart.cartItems?.splice(
      0,
      cart.cartItems.length,
    );

    await this.cartRepository
      .getRepository()
      .save(cart);

    this.logger.log(
      `[CART] Xóa toàn bộ giỏ hàng thành công | User ID: ${currentUser.id}`,
    );

    return {
      status: true,
      message: 'Xóa giỏ hàng thành công',
    };
  }
}
