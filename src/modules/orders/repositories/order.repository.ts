import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order } from 'src/modules/orders/entities/order.entity';
import { OrderStatus } from 'src/common/constants/order-status.enum';
import { PaymentMethod } from 'src/common/constants/payment-method.enum';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repository: Repository<Order>,
  ) {}

  findByUserIdAndStatus(
    userId: string,
    status: OrderStatus,
    page: number,
    pageSize: number,
  ) {
    return this.repository
      .createQueryBuilder('order')
      .leftJoin('order.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('order.status = :status', { status })
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
  }

  findByUserId(
    userId: string,
    page: number,
    pageSize: number,
  ) {
    return this.repository
      .createQueryBuilder('order')
      .leftJoin('order.user', 'user')
      .where('user.id = :userId', { userId })
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
  }

  findByStatusAndPaymentMethodAndCreatedDateBefore(
    status: OrderStatus,
    paymentMethod: PaymentMethod,
    threshold: Date,
  ) {
    return this.repository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.payment', 'payment')
      .where('order.status = :status', { status })
      .andWhere('payment.paymentMethod = :paymentMethod', {
        paymentMethod,
      })
      .andWhere('order.createdDate < :threshold', { threshold })
      .getMany();
  }

  getRepository(): Repository<Order> {
    return this.repository;
  }
}
