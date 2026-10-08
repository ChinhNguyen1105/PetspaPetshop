import { CartDto } from 'src/modules/cart/dto/response/cart.dto';
import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';

export interface CartService {
  getCart(): Promise<CartDto>;
  deleteCart(): Promise<CommonResponseDto>;
}
