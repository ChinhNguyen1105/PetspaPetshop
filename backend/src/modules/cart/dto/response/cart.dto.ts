import { CartItemDto } from 'src/modules/cart/dto/response/cart-item.dto';

export class CartDto {
  id?: number;

  itemDtoList: CartItemDto[];

  totalAmount: number;

  totalItem: number;
}
