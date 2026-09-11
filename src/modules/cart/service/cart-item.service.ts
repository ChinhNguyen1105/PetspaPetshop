import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';
import { ReqAddCartItemDto } from 'src/modules/cart/dto/request/req-add-cart-item.dto';
import { ReqUpdateCartItemDto } from 'src/modules/cart/dto/request/req-update-cart-item.dto';
import { CartItemDto } from 'src/modules/cart/dto/response/cart-item.dto';

export interface CartItemService {
  addCartItem(reqAddCartItem: ReqAddCartItemDto): Promise<CartItemDto>;

  updateCartItem(req: ReqUpdateCartItemDto): Promise<CartItemDto | null>;

  deleteCartItem(itemId: number): Promise<CommonResponseDto>;
}
