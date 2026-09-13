import {
  Delete,
  Get,
  HttpStatus,
  Inject,
} from '@nestjs/common';

import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import { VsResponseUtil } from 'src/common/base/vs-response.util';
import { UrlConstant } from 'src/common/constants/url.constant';
import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

import type { CartService } from 'src/modules/cart/service/cart.service';

@RestApiV1()
export class CartController {
  constructor(
    @Inject(PROVIDER_TOKEN.CART_SERVICE)
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

