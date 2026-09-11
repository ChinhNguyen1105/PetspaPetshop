import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderDetail } from 'src/modules/orders/entities/order-detail.entity';
import { OrderStatus } from 'src/common/constants/order-status.enum';

@Injectable()
export class OrderDetailRepository {
  constructor(
    @InjectRepository(OrderDetail)
    private readonly repository: Repository<OrderDetail>,
  ) {}

  existsByProductIdAndOrderUserIdAndOrderStatus(
    productId: number,
    userId: string,
    status: OrderStatus,
  ) {
    return this.repository
      .createQueryBuilder('orderDetail')
      .leftJoin('orderDetail.order', 'order')
      .leftJoin('order.user', 'user')
      .leftJoin('orderDetail.product', 'product')
      .where('product.id = :productId', { productId })
      .andWhere('user.id = :userId', { userId })
      .andWhere('order.status = :status', { status })
      .getExists();
  }

  getRepository(): Repository<OrderDetail> {
    return this.repository;
  }
}
