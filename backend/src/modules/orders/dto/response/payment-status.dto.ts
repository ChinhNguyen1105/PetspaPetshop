import { OrderStatus } from 'src/common/constants/order-status.enum';
import { PaymentStatus } from 'src/common/constants/payment-status.enum';

export class PaymentStatusDto {
  orderId: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  transactionId: string;
  paymentMethod: string;
}
