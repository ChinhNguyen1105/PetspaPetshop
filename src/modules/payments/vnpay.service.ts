import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Request } from 'express';

import { VNPayUtil } from 'src/common/utils/vnpay.util';
import { OrderStatus } from 'src/common/constants/order-status.enum';
import { OrderType } from 'src/common/constants/order-type.enum';
import { PaymentStatus } from 'src/common/constants/payment-status.enum';
import { PaymentMethod } from 'src/common/constants/payment-method.enum';
import { BookingStatus } from 'src/common/constants/booking-status.enum';
import { TypeInventory } from 'src/common/constants/type-inventory.enum';

import { Order } from 'src/modules/orders/entities/order.entity';
import { Booking } from 'src/modules/bookings/entities/booking.entity';
import { Inventory } from 'src/modules/inventory/entities/inventory.entity';
import { InventoryTransaction } from 'src/modules/inventory/entities/inventory-transaction.entity';
import type { UserService } from 'src/modules/users/service/user.service';
import { PaymentStatusDto } from 'src/modules/orders/dto/response/payment-status.dto';
import { Inject } from '@nestjs/common';
import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';
@Injectable()
export class VNPayService {
  constructor(
    private readonly configService: ConfigService,
    private readonly vnPayUtil: VNPayUtil,
    private readonly dataSource: DataSource,

    @Inject(PROVIDER_TOKEN.USER_SERVICE)
    private readonly userService: UserService,
  ) {}

  async createPaymentUrl(orderId: number, request: Request): Promise<string> {
    const order = await this.dataSource.getRepository(Order).findOne({
      where: { id: orderId },
      relations: ['payment'],
    });

    if (!order) {
      throw new NotFoundException(`Not found order with id: ${orderId}`);
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order status is not in PENDING status');
    }

    const tmnCode = this.configService.get<string>('vnpay.tmnCode');
    const hashSecret = this.configService.get<string>('vnpay.hashSecret');
    const vnpayUrl = this.configService.get<string>('vnpay.url');
    const returnUrl = this.configService.get<string>('vnpay.returnUrl');

    if (!tmnCode || !hashSecret || !vnpayUrl || !returnUrl) {
      throw new Error('VNPAY configuration is incomplete');
    }

    const vnpTxnRef = `${orderId}_${Date.now()}`;

    const vnpAmount = String(Math.round(Number(order.totalAmount ?? 0) * 100));

    const now = new Date();

    const vnpParams: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Amount: vnpAmount,
      vnp_CurrCode: 'VND',
      vnp_TxnRef: vnpTxnRef,
      vnp_OrderInfo: `Order_${orderId}`,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: this.vnPayUtil.getCurrentIp(request),
      vnp_CreateDate: this.formatDate(now),
      vnp_ExpireDate: this.formatDate(new Date(now.getTime() + 15 * 60 * 1000)),
    };

    const sortedEntries = Object.entries(vnpParams).sort(([keyA], [keyB]) =>
      keyA.localeCompare(keyB),
    );

    const hashData = sortedEntries
      .filter(
        ([, value]) => value !== null && value !== undefined && value !== '',
      )
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    const query = sortedEntries
      .filter(
        ([, value]) => value !== null && value !== undefined && value !== '',
      )
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join('&');

    const secureHash = this.vnPayUtil.hmacSHA512(hashSecret, hashData);

    return `${vnpayUrl}?${query}&vnp_SecureHash=${secureHash}`;
  }

  async handleReturn(request: Request): Promise<string> {
    const hashSecret = this.configService.get<string>('vnpay.hashSecret');

    if (!hashSecret) {
      throw new Error('VNPAY hash secret is not configured');
    }

    const params = new Map<string, string>();

    Object.entries(request.query).forEach(([key, value]) => {
      if (
        key.startsWith('vnp_') &&
        key !== 'vnp_SecureHash' &&
        key !== 'vnp_SecureHashType'
      ) {
        const parameterValue = Array.isArray(value) ? value[0] : value;

        if (
          parameterValue !== undefined &&
          parameterValue !== null &&
          parameterValue !== ''
        ) {
          params.set(key, String(parameterValue));
        }
      }
    });

    const sortedParams = [...params.entries()].sort(([keyA], [keyB]) =>
      keyA.localeCompare(keyB),
    );

    const hashData = sortedParams
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const secureHashValue = request.query.vnp_SecureHash;

    const secureHash = Array.isArray(secureHashValue)
      ? typeof secureHashValue[0] === 'string'
        ? secureHashValue[0]
        : undefined
      : typeof secureHashValue === 'string'
        ? secureHashValue
        : undefined;

    const computedHash = this.vnPayUtil.hmacSHA512(hashSecret, hashData);

    if (computedHash !== secureHash) {
      return 'INVALID_SIGNATURE';
    }

    const responseCode = this.getQueryString(request.query.vnp_ResponseCode);

    const txnRef = this.getQueryString(request.query.vnp_TxnRef);

    const transactionId = this.getQueryString(request.query.vnp_TransactionNo);

    if (!txnRef) {
      throw new BadRequestException('VNPAY transaction reference is missing');
    }

    const orderId = Number(txnRef.split('_')[0]);

    if (!Number.isInteger(orderId)) {
      throw new BadRequestException('Invalid VNPAY transaction reference');
    }

    return this.dataSource.transaction(async (manager) => {
      const orderRepository = manager.getRepository(Order);
      const bookingRepository = manager.getRepository(Booking);
      const inventoryRepository = manager.getRepository(Inventory);
      const inventoryTransactionRepository =
        manager.getRepository(InventoryTransaction);

      const order = await orderRepository.findOne({
        where: { id: orderId },
        relations: ['payment', 'orderDetails', 'orderDetails.product'],
      });

      if (!order) {
        throw new NotFoundException('Không tìm thấy đơn hàng');
      }

      if (!order.payment) {
        throw new NotFoundException('Không tìm thấy payment của đơn hàng');
      }

      if (order.payment.status !== PaymentStatus.PENDING) {
        return order.payment.status === PaymentStatus.SUCCESS
          ? 'SUCCESS'
          : 'FAILED';
      }

      const isSuccess = responseCode === '00';
      let stockShortage = false;

      if (isSuccess) {
        order.payment.status = PaymentStatus.SUCCESS;
        order.payment.transactionId = transactionId ?? null;
        order.payment.paymentMethod = PaymentMethod.VNPAY;
        order.status = OrderStatus.PROCESSING;

        if (order.orderType === OrderType.PRODUCT) {
          for (const orderDetail of order.orderDetails ?? []) {
            if (orderDetail.quantity === null) {
              throw new BadRequestException(
                '[ORDER] Số lượng sản phẩm không hợp lệ',
              );
            }

            const productId = orderDetail.product?.id;

            if (!productId) {
              throw new NotFoundException(
                '[ORDER] Sản phẩm không tồn tại trong kho',
              );
            }

            const inventory = await inventoryRepository
              .createQueryBuilder('inventory')
              .leftJoinAndSelect('inventory.product', 'product')
              .where('product.id = :productId', { productId })
              .getOne();

            if (!inventory) {
              throw new NotFoundException(
                '[ORDER] Sản phẩm không tồn tại trong kho',
              );
            }

            const oldQuantity = inventory.quantity ?? 0;

            if (oldQuantity < orderDetail.quantity) {
              stockShortage = true;
              break;
            }

            inventory.quantity = oldQuantity - orderDetail.quantity;

            await inventoryRepository.save(inventory);

            const inventoryTransaction = inventoryTransactionRepository.create({
              inventory,
              quantity: orderDetail.quantity,
              type: TypeInventory.EXPORT,
              note: 'Export product to order after successful payment',
            });

            await inventoryTransactionRepository.save(inventoryTransaction);
          }
        }

        if (stockShortage) {
          order.status = OrderStatus.CANCELLED;
          order.payment.status = PaymentStatus.REFUNDED;
        }
      } else {
        order.payment.status = PaymentStatus.FAILED;
      }

      await orderRepository.save(order);

      if (order.orderType === OrderType.BOOKING) {
        const booking = await bookingRepository
          .createQueryBuilder('booking')
          .leftJoinAndSelect('booking.order', 'order')
          .where('order.id = :orderId', { orderId })
          .getOne();

        if (booking) {
          booking.status = isSuccess
            ? BookingStatus.CONFIRMED
            : BookingStatus.CANCELLED;

          await bookingRepository.save(booking);
        }
      }

      if (stockShortage) {
        return 'STOCK_SHORTAGE';
      }

      return isSuccess ? 'SUCCESS' : 'FAILED';
    });
  }

  async getPaymentStatus(orderId: number): Promise<PaymentStatusDto> {
    const order = await this.dataSource.getRepository(Order).findOne({
      where: { id: orderId },
      relations: ['payment', 'user'],
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng ID: ${orderId}`);
    }

    const currentUser = await this.userService.getUserLogin();

    if (String(order.user.id) !== String(currentUser.id)) {
      throw new ForbiddenException(
        'You are not allowed to perform this action',
      );
    }

    const dto = new PaymentStatusDto();

    dto.orderId = order.id;
    dto.orderStatus = order.status as OrderStatus;
    dto.totalAmount = Number(order.totalAmount ?? 0);
    dto.transactionId = order.payment?.transactionId ?? '';

    if (order.payment) {
      dto.paymentStatus = order.payment.status as PaymentStatus;

      dto.transactionId = order.payment.transactionId ?? '';

      dto.paymentMethod = order.payment.paymentMethod?.toString() ?? '';
    }

    return dto;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hour}${minute}${second}`;
  }

  private getQueryString(value: unknown): string | undefined {
    if (typeof value === 'string') {
      return value;
    }

    if (Array.isArray(value)) {
      const firstValue = value[0];

      return typeof firstValue === 'string' ? firstValue : undefined;
    }

    return undefined;
  }
}
