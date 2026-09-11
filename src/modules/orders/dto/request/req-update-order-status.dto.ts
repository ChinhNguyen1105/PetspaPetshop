import {
  IsDefined,
  IsOptional,
  IsString,
} from 'class-validator';

import { OrderStatus } from 'src/common/constants/order-status.enum';
import { EnumValue } from 'src/common/validators/enum-value.decorator';

export class ReqUpdateOrderStatusDto {
  @IsDefined({ message: 'Order ID is required' })
  orderId: number;

  @IsDefined({ message: 'Status is required' })
  @IsString()
  @EnumValue(OrderStatus)
  status: string;

  @IsOptional()
  @IsString()
  note: string | null;
}
