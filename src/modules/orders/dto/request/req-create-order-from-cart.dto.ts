import {
  IsDefined,
  IsNotEmpty,
  IsString,
} from 'class-validator';

import { PaymentMethod } from 'src/common/constants/payment-method.enum';
import { EnumValue } from 'src/common/validators/enum-value.decorator';

export class ReqCreateOrderFromCartDto {
  @IsDefined({ message: 'Cart item IDs are required' })
  cartItemIds: number[];

  @IsDefined({ message: 'Address ID is required' })
  addressId: number;

  @IsDefined({ message: 'Payment method is required' })
  @IsString()
  @EnumValue(PaymentMethod)
  paymentMethod: PaymentMethod;
}
