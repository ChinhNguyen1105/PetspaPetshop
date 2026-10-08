import { Injectable } from '@nestjs/common';

import { Order } from 'src/modules/orders/entities/order.entity';
import { OrderDto } from 'src/modules/orders/dto/response/order.dto';
import { OrderDetailMapper } from 'src/modules/orders/mapper/order-detail.mapper';

@Injectable()
export class OrderMapper {
  constructor(
    private readonly orderDetailMapper: OrderDetailMapper,
  ) {}

  toDto(order: Order): OrderDto {
    const dto = new OrderDto();

    dto.id = order.id;
    dto.shippingName = order.shippingName;
    dto.shippingPhone = order.shippingPhone;
    dto.shippingAddressFull = order.shippingAddressFull;
    dto.totalAmount = order.totalAmount;
    dto.status = order.status;

    dto.paymentStatus = order.payment?.status ?? null;
    dto.paymentMethod = order.payment?.paymentMethod ?? null;

    dto.orderDetails = order.orderDetails
      ? this.orderDetailMapper.toDtos(order.orderDetails)
      : [];

    dto.createdDate = order.createdDate;
    dto.orderType = order.orderType;

    return dto;
  }

  toDtoList(orders: Order[]): OrderDto[] {
    return orders.map((order) => this.toDto(order));
  }
}
