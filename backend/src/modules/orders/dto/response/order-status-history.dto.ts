import { OrderStatus } from 'src/common/constants/order-status.enum';

export class OrderStatusHistoryDto {
  id: number;
  status: OrderStatus;
  note: string;
  changedAt: Date;
}
