import {
  Delete,
  Get,
  HttpStatus,
} from '@nestjs/common';

import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import { VsResponseUtil } from 'src/common/base/vs-response.util';
import { UrlConstant } from 'src/common/constants/url.constant';

import type { CartService } from 'src/modules/cart/service/cart.service';

@RestApiV1()
export class CartController {
  constructor(
    private readonly cartService: CartService,
  ) {}

  @Get(UrlConstant.Cart.GET_CART)
  async getCard() {
    const cartDto = await this.cartService.getCart();

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      cartDto,
    );
  }

  @Delete(UrlConstant.Cart.DELETE_CART)
  async deleteCartItem() {
    const commonResponseDto =
      await this.cartService.deleteCart();

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      commonResponseDto,
    );
  }
}
