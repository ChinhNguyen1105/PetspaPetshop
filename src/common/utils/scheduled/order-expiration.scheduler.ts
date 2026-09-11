import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { OrderRepository } from 'src/modules/orders/repositories/order.repository';
import { OrderStatus } from 'src/common/constants/order-status.enum';
import { PaymentMethod } from 'src/common/constants/payment-method.enum';
import { PaymentStatus } from 'src/common/constants/payment-status.enum';

@Injectable()
export class OrderExpirationScheduler {
  private readonly logger = new Logger(OrderExpirationScheduler.name);

  constructor(
    private readonly orderRepository: OrderRepository,
  ) {}

  // Chạy mỗi 1 phút
  @Cron('* * * * *')
  async cancelExpiredPendingOrders(): Promise<void> {
    const expiredThreshold = new Date(
      Date.now() - 15 * 60 * 1000,
    );

    const expiredOrders =
      await this.orderRepository
        .findByStatusAndPaymentMethodAndCreatedDateBefore(
          OrderStatus.PENDING,
          PaymentMethod.VNPAY,
          expiredThreshold,
        );

    const filteredOrders = expiredOrders.filter(
      (order) =>
        order.payment !== null &&
        order.payment?.paymentMethod === PaymentMethod.VNPAY,
    );

    if (filteredOrders.length === 0) {
      return;
    }

    this.logger.log(
      `[SCHEDULER] Tìm thấy ${filteredOrders.length} đơn VNPAY quá hạn thanh toán`,
    );

    for (const order of filteredOrders) {
      order.status = OrderStatus.CANCELLED;

      if (order.payment) {
        order.payment.status = PaymentStatus.FAILED;
      }

      await this.orderRepository.getRepository().save(order);

      this.logger.log(
        `[SCHEDULER] Đã hủy đơn quá hạn | Order ID: ${order.id}`,
      );
    }
  }
}
