import {
  Body,
  Delete,
  HttpStatus,
  Param,
  Post,
  Put,
  Inject,
} from '@nestjs/common';

import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import { VsResponseUtil } from 'src/common/base/vs-response.util';
import { UrlConstant } from 'src/common/constants/url.constant';
import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

import { ReqAddCartItemDto } from 'src/modules/cart/dto/request/req-add-cart-item.dto';
import { ReqUpdateCartItemDto } from 'src/modules/cart/dto/request/req-update-cart-item.dto';

import type { CartItemService } from 'src/modules/cart/service/cart-item.service';

@RestApiV1()
export class CartItemController {
  constructor(
    @Inject(PROVIDER_TOKEN.CART_ITEM_SERVICE)
    private readonly cartItemService: CartItemService,
  ) {}

  @Post(UrlConstant.CartItem.ADD_CART_ITEM)
  async addCartItem(@Body() reqAddCartItem: ReqAddCartItemDto) {
    const cartItemDto = await this.cartItemService.addCartItem(reqAddCartItem);

    return VsResponseUtil.successWithStatus(HttpStatus.OK, cartItemDto);
  }

  @Put(UrlConstant.CartItem.UPDATE_CART_ITEM)
  async updateCartItem(@Body() reqUpdateCartItem: ReqUpdateCartItemDto) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.cartItemService.updateCartItem(reqUpdateCartItem),
    );
  }

  @Delete(UrlConstant.CartItem.DELETE_CART_ITEM)
  async deleteCartItem(@Param('id') id: number) {
    const commonResponseDto = await this.cartItemService.deleteCartItem(id);

    return VsResponseUtil.successWithStatus(HttpStatus.OK, commonResponseDto);
  }
}
