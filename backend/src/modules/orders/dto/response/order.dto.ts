import { OrderStatus } from 'src/common/constants/order-status.enum';
import { OrderType } from 'src/common/constants/order-type.enum';
import { PaymentMethod } from 'src/common/constants/payment-method.enum';
import { PaymentStatus } from 'src/common/constants/payment-status.enum';
import { OrderDetailDto } from 'src/modules/orders/dto/response/order-detail.dto';

export class OrderDto {
  id: number;

  shippingName: string | null;
  shippingPhone: string | null;
  shippingAddressFull: string | null;
  totalAmount: number | null;

  status: OrderStatus | null;

  paymentStatus: PaymentStatus | null;
  paymentMethod: PaymentMethod | null;

  orderDetails: OrderDetailDto[];

  createdDate: Date;
  orderType: OrderType;
}
