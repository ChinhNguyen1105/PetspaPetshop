import {
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

import { PaymentMethod } from 'src/common/constants/payment-method.enum';
import { EnumValue } from 'src/common/validators/enum-value.decorator';

export class ReqCreateOrderBuyNowDto {
  @IsNotEmpty({
    message: 'Product ID is required',
  })
  @IsNumber()
  productId: number;

  @IsNotEmpty({
    message: 'Quantity is required',
  })
  @IsNumber()
  quantity: number;

  @IsNotEmpty({
    message: 'Address ID is required',
  })
  @IsNumber()
  addressId: number;

  @IsNotEmpty({
    message: 'Payment method is required',
  })
  @EnumValue(PaymentMethod)
  paymentMethod: PaymentMethod;
}
