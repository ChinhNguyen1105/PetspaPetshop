import { IsOptional } from 'class-validator';

import { OrderStatus } from 'src/common/constants/order-status.enum';
import { EnumValue } from 'src/common/validators/enum-value.decorator';

export class ReqOrderStatusDto {
  @IsOptional()
  @EnumValue(OrderStatus)
  status: string | null;
}
