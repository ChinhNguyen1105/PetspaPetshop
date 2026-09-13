
import { Inject, Injectable } from '@nestjs/common';

import { BadRequestException } from 'src/common/exceptions/bad-request.exception';
import { ForbiddenException } from 'src/common/exceptions/forbidden.exception';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';

import { OrderStatus } from 'src/common/constants/order-status.enum';
import { PaymentMethod } from 'src/common/constants/payment-method.enum';
import { PaymentStatus } from 'src/common/constants/payment-status.enum';
import { TypeInventory } from 'src/common/constants/type-inventory.enum';
import { RoleConstant } from 'src/common/constants/role.constant';
import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

import {
  Meta,
  ResultPaginationDto,
} from 'src/common/dto/pagination/result-pagination.dto';

import { ReqCreateOrderFromCartDto } from 'src/modules/orders/dto/request/req-create-order-from-cart.dto';
import { ReqCreateOrderBuyNowDto } from 'src/modules/orders/dto/request/req-create-order-buy-now.dto';
import { ReqOrderStatusDto } from 'src/modules/orders/dto/request/req-order-status.dto';
import { ReqUpdateOrderStatusDto } from 'src/modules/orders/dto/request/req-update-order-status.dto';
import { OrderDto } from 'src/modules/orders/dto/response/order.dto';

import { Order } from 'src/modules/orders/entities/order.entity';
import { OrderDetail } from 'src/modules/orders/entities/order-detail.entity';

import { OrderRepository } from 'src/modules/orders/repositories/order.repository';
import { OrderMapper } from 'src/modules/orders/mapper/order.mapper';

import { CartRepository } from 'src/modules/cart/repositories/cart.repository';
import { ShippingAddressRepository } from 'src/modules/shipping/repositories/shipping-address.repository';
import { InventoryRepository } from 'src/modules/inventory/repositories/inventory.repository';
import { InventoryTransactionRepository } from 'src/modules/inventory/repositories/inventory-transaction.repository';
import { ProductRepository } from 'src/modules/catalogue/products/repositories/product.repository';

import { ShippingAddressMapper } from 'src/modules/shipping/mapper/shipping-address.mapper';

import { Cart } from 'src/modules/cart/entities/cart.entity';
import { CartItem } from 'src/modules/cart/entities/cart-item.entity';
import { Payment } from 'src/modules/payments/entities/payment.entity';
import { Inventory } from 'src/modules/inventory/entities/inventory.entity';
import { InventoryTransaction } from 'src/modules/inventory/entities/inventory-transaction.entity';

import type { UserService } from 'src/modules/users/service/user.service';
import type { OrderService } from 'src/modules/orders/service/order.service';

@Injectable()
export class OrderServiceImpl implements OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,

    @Inject(PROVIDER_TOKEN.USER_SERVICE)
    private readonly userService: UserService,

    private readonly orderMapper: OrderMapper,
    private readonly cartRepository: CartRepository,
    private readonly shippingAddressRepository: ShippingAddressRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly shippingAddressMapper: ShippingAddressMapper,
    private readonly inventoryTransactionRepository: InventoryTransactionRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async createOrderFromCart(
    req: ReqCreateOrderFromCartDto,
  ): Promise<OrderDto> {
    const currentUser =
      await this.userService.getUserLogin();

    const cart =
      await this.cartRepository.findByUserId(
        currentUser.id,
      );

    if (!cart) {
      throw new NotFoundException(
        '[ORDER] Bạn không có giỏ hàng nào',
      );
    }

    const selectedItems =
      (cart.cartItems ?? []).filter(
        (item) =>
          req.cartItemIds.includes(item.id),
      );

    if (selectedItems.length === 0) {
      throw new BadRequestException(
        '[ORDER] Bạn chưa chọn sản phẩm nào',
      );
    }

    const shippingAddress =
      await this.shippingAddressRepository.findById(
        req.addressId,
      );

    if (!shippingAddress) {
      throw new NotFoundException(
        '[ORDER] Địa chỉ giao hàng không tồn tại',
      );
    }

    if (
      shippingAddress.user.id !==
      currentUser.id
    ) {
      throw new ForbiddenException(
        '[ORDER] Bạn không có quyền thao tác với địa chỉ giao hàng này',
      );
    }

    for (const item of selectedItems) {
      const inventory =
        await this.inventoryRepository.findByProductId(
          item.product.id,
        );

      if (!inventory) {
        throw new NotFoundException(
          '[ORDER] Sản phẩm không tồn tại',
        );
      }

      if (
        (inventory.quantity ?? 0) <
        item.quantity
      ) {
        throw new NotFoundException(
          '[ORDER] Số lượng sản phẩm trong kho không đủ',
        );
      }
    }

    const order = new Order();

    order.user = currentUser;
    order.shippingName =
      shippingAddress.fullName;
    order.shippingPhone =
      shippingAddress.phone;
    order.shippingAddressFull =
      this.shippingAddressMapper.buildFullAddress(
        shippingAddress,
      );
    order.status = OrderStatus.PENDING;
    order.orderDetails = [];

    let totalAmount = 0;

    for (const item of selectedItems) {
      const orderDetail = new OrderDetail();

      orderDetail.order = order;
      orderDetail.product = item.product;
      orderDetail.quantity = item.quantity;
      orderDetail.unitPrice = Number(
        item.product.price,
      );

      order.orderDetails.push(orderDetail);

      totalAmount +=
        Number(item.product.price) *
        item.quantity;
    }

    order.totalAmount = totalAmount;

    const payment = new Payment();

    payment.order = order;
    payment.paymentMethod =
      req.paymentMethod;
    payment.amount = totalAmount;
    payment.status = PaymentStatus.PENDING;

    order.payment = payment;

    const savedOrder =
      await this.orderRepository
        .getRepository()
        .save(order);

    await this.deductInventoryIfCod(
      savedOrder,
    );

    cart.cartItems =
      (cart.cartItems ?? []).filter(
        (item) =>
          !selectedItems.some(
            (selected) =>
              selected.id === item.id,
          ),
      );

    await this.cartRepository
      .getRepository()
      .save(cart);

    return this.orderMapper.toDto(
      savedOrder,
    );
  }

  async createOrderFromBuyNow(
    req: ReqCreateOrderBuyNowDto,
  ): Promise<OrderDto> {
    const currentUser =
      await this.userService.getUserLogin();

    const product =
      await this.productRepository
        .getRepository()
        .findOne({
          where: {
            id: req.productId,
          },
        });

    if (!product) {
      throw new NotFoundException(
        '[ORDER] Sản phẩm không tồn tại',
      );
    }

    if (req.quantity <= 0) {
      throw new BadRequestException(
        '[ORDER] Số lượng phải lớn hơn 0',
      );
    }

    const inventory =
      await this.inventoryRepository.findByProductId(
        product.id,
      );

    if (!inventory) {
      throw new NotFoundException(
        '[ORDER] Sản phẩm không tồn tại',
      );
    }

    if (
      (inventory.quantity ?? 0) <
      req.quantity
    ) {
      throw new NotFoundException(
        '[ORDER] Số lượng sản phẩm trong kho không đủ',
      );
    }

    const shippingAddress =
      await this.shippingAddressRepository.findById(
        req.addressId,
      );

    if (!shippingAddress) {
      throw new NotFoundException(
        '[ORDER] Địa chỉ giao hàng không tồn tại',
      );
    }

    if (
      shippingAddress.user.id !==
      currentUser.id
    ) {
      throw new ForbiddenException(
        '[ORDER] Bạn không có quyền thao tác với địa chỉ giao hàng này',
      );
    }

    const totalAmount =
      Number(product.price) *
      req.quantity;

    const payment = new Payment();

    payment.paymentMethod =
      req.paymentMethod;
    payment.status = PaymentStatus.PENDING;
    payment.amount = totalAmount;

    const order = new Order();

    order.user = currentUser;
    order.shippingName =
      shippingAddress.fullName;
    order.shippingPhone =
      shippingAddress.phone;
    order.shippingAddressFull =
      this.shippingAddressMapper.buildFullAddress(
        shippingAddress,
      );
    order.status = OrderStatus.PENDING;
    order.totalAmount = totalAmount;
    order.payment = payment;
    order.orderDetails = [];

    const orderDetail = new OrderDetail();

    orderDetail.product = product;
    orderDetail.order = order;
    orderDetail.quantity = req.quantity;
    orderDetail.unitPrice =
      Number(product.price);

    order.orderDetails.push(orderDetail);

    const savedOrder =
      await this.orderRepository
        .getRepository()
        .save(order);

    await this.deductInventoryIfCod(
      savedOrder,
    );

    return this.orderMapper.toDto(
      savedOrder,
    );
  }

  private async deductInventoryIfCod(
    order: Order,
  ): Promise<void> {
    if (
      order.payment?.paymentMethod !==
      PaymentMethod.COD
    ) {
      return;
    }

    for (const orderDetail of
      order.orderDetails ?? []) {
      const productId =
        orderDetail.product.id;

      const inventory =
        await this.inventoryRepository.findByProductId(
          productId,
        );

      if (!inventory) {
        throw new NotFoundException(
          '[ORDER] Sản phẩm không tồn tại trong kho',
        );
      }

      const oldQuantity =
        inventory.quantity ?? 0;

      const newQuantity =
        oldQuantity -
        (orderDetail.quantity ?? 0);

      inventory.quantity = newQuantity;

      await this.inventoryRepository
        .getRepository()
        .save(inventory);

      const inventoryTransaction =
        new InventoryTransaction();

      inventoryTransaction.inventory =
        inventory;
      inventoryTransaction.quantity =
        orderDetail.quantity;
      inventoryTransaction.type =
        TypeInventory.EXPORT;
      inventoryTransaction.note =
        'Export product to order (COD)';

      await this.inventoryTransactionRepository
        .getRepository()
        .save(inventoryTransaction);
    }
  }

  async getMyOrders(
    orderStatus: ReqOrderStatusDto,
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto> {
    const currentUser =
      await this.userService.getUserLogin();

    let status: OrderStatus | null = null;

    if (orderStatus.status != null) {
      const normalized =
        orderStatus.status
          .toUpperCase()
          .trim();

      if (
        !Object.values(OrderStatus).includes(
          normalized as OrderStatus,
        )
      ) {
        throw new BadRequestException(
          '[ORDER] Status không hợp lệ',
        );
      }

      status =
        normalized as OrderStatus;
    }

    const [orders, total] =
      status !== null
        ? await this.orderRepository
            .findByUserIdAndStatus(
              currentUser.id,
              status,
              page,
              pageSize,
            )
        : await this.orderRepository
            .findByUserId(
              currentUser.id,
              page,
              pageSize,
            );

    return this.buildPaginationResponse(
      this.orderMapper.toDtoList(orders),
      page,
      pageSize,
      total,
    );
  }

  async getOrderDetail(
    orderId: number,
  ): Promise<OrderDto> {
    const order =
      await this.orderRepository
        .getRepository()
        .findOne({
          where: {
            id: orderId,
          },
          relations: [
            'user',
            'payment',
            'orderDetails',
            'orderDetails.product',
            'orderDetails.product.productImages',
          ],
        });

    if (!order) {
      throw new NotFoundException(
        '[ORDER] Đơn hàng không tồn tại',
      );
    }

    const currentUser =
      await this.userService.getUserLogin();

    const isAdmin =
      currentUser.role?.name ===
      RoleConstant.ADMIN;

    if (
      !isAdmin &&
      order.user.id !== currentUser.id
    ) {
      throw new ForbiddenException(
        '[ORDER] Bạn không có quyền thao tác với đơn hàng này',
      );
    }

    return this.orderMapper.toDto(order);
  }

  async cancelOrder(
    orderId: number,
  ): Promise<OrderDto> {
    const order =
      await this.orderRepository
        .getRepository()
        .findOne({
          where: {
            id: orderId,
          },
          relations: [
            'user',
            'payment',
            'orderDetails',
            'orderDetails.product',
          ],
        });

    if (!order) {
      throw new NotFoundException(
        '[ORDER] Đơn hàng không tồn tại',
      );
    }

    const currentUser =
      await this.userService.getUserLogin();

    if (
      order.user.id !== currentUser.id
    ) {
      throw new ForbiddenException(
        '[ORDER] Bạn không có quyền thao tác với đơn hàng này',
      );
    }

    if (
      order.status !==
      OrderStatus.PENDING
    ) {
      throw new BadRequestException(
        '[ORDER] Chỉ được hủy đơn hàng ở trạng thái PENDING',
      );
    }

    if (
      order.payment?.paymentMethod ===
      PaymentMethod.COD
    ) {
      for (const orderDetail of
        order.orderDetails ?? []) {
        const inventory =
          await this.inventoryRepository.findByProductId(
            orderDetail.product.id,
          );

        if (!inventory) {
          throw new NotFoundException(
            '[ORDER] Sản phẩm không tồn tại',
          );
        }

        const oldQuantity =
          inventory.quantity ?? 0;

        const newQuantity =
          oldQuantity +
          (orderDetail.quantity ?? 0);

        inventory.quantity = newQuantity;

        await this.inventoryRepository
          .getRepository()
          .save(inventory);

        const transaction =
          new InventoryTransaction();

        transaction.inventory =
          inventory;
        transaction.quantity =
          orderDetail.quantity;
        transaction.type =
          TypeInventory.IMPORT;
        transaction.note =
          'Import product from cancel order';

        await this.inventoryTransactionRepository
          .getRepository()
          .save(transaction);
      }
    }

    order.status =
      OrderStatus.CANCELLED;

    if (order.payment) {
      if (
        order.payment.status ===
        PaymentStatus.PENDING
      ) {
        order.payment.status =
          PaymentStatus.FAILED;
      } else if (
        order.payment.status ===
        PaymentStatus.SUCCESS
      ) {
        order.payment.status =
          PaymentStatus.REFUNDED;
      }
    }

    const updatedOrder =
      await this.orderRepository
        .getRepository()
        .save(order);

    return this.orderMapper.toDto(
      updatedOrder,
    );
  }

  validateStatusTransaction(
    current: OrderStatus,
    next: OrderStatus,
  ): void {
    const validTransactions: Record<
      OrderStatus,
      OrderStatus[]
    > = {
      [OrderStatus.PENDING]: [
        OrderStatus.PROCESSING,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.PROCESSING]: [
        OrderStatus.SHIPPED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.SHIPPED]: [
        OrderStatus.DELIVERED,
      ],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    const allowed =
      validTransactions[current] ?? [];

    if (!allowed.includes(next)) {
      throw new BadRequestException(
        `Cannot change status from ${current} → ${next}`,
      );
    }
  }

  async updateOrderStatus(
    req: ReqUpdateOrderStatusDto,
  ): Promise<OrderDto> {
    const normalized =
      req.status
        .toUpperCase()
        .trim();

    if (
      !Object.values(OrderStatus).includes(
        normalized as OrderStatus,
      )
    ) {
      throw new BadRequestException(
        'Trạng thái không tồn tại',
      );
    }

    const newStatus =
      normalized as OrderStatus;

    const order =
      await this.orderRepository
        .getRepository()
        .findOne({
          where: {
            id: req.orderId,
          },
          relations: [
            'payment',
            'orderDetails',
            'orderDetails.product',
          ],
        });

    if (!order) {
      throw new NotFoundException(
        '[ORDER] Đơn hàng không tồn tại',
      );
    }

    if (order.status == null) {
      throw new BadRequestException(
        '[ORDER] Trạng thái hiện tại của đơn hàng không hợp lệ',
      );
    }

    this.validateStatusTransaction(
      order.status,
      newStatus,
    );

    if (
      newStatus ===
      OrderStatus.CANCELLED
    ) {
      for (const orderDetail of
        order.orderDetails ?? []) {
        const inventory =
          await this.inventoryRepository.findByProductId(
            orderDetail.product.id,
          );

        if (!inventory) {
          throw new NotFoundException(
            '[INVENTORY] Sản phẩm không tồn tại',
          );
        }

        const oldQuantity =
          inventory.quantity ?? 0;

        const newQuantity =
          oldQuantity +
          (orderDetail.quantity ?? 0);

        inventory.quantity = newQuantity;

        await this.inventoryRepository
          .getRepository()
          .save(inventory);

        const transaction =
          new InventoryTransaction();

        transaction.inventory =
          inventory;
        transaction.quantity =
          orderDetail.quantity;
        transaction.type =
          TypeInventory.IMPORT;
        transaction.note =
          'Import product from cancel order by admin';

        await this.inventoryTransactionRepository
          .getRepository()
          .save(transaction);
      }
    }

    if (order.payment) {
      switch (newStatus) {
        case OrderStatus.DELIVERED:
          order.payment.status =
            PaymentStatus.SUCCESS;
          break;

        case OrderStatus.CANCELLED:
          if (
            order.payment.status ===
            PaymentStatus.SUCCESS
          ) {
            order.payment.status =
              PaymentStatus.REFUNDED;
          } else {
            order.payment.status =
              PaymentStatus.FAILED;
          }
          break;

        default:
          break;
      }
    }

    order.status = newStatus;

    const updatedOrder =
      await this.orderRepository
        .getRepository()
        .save(order);

    return this.orderMapper.toDto(
      updatedOrder,
    );
  }

  async getAllOrders(
    filter: string[],
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto> {
    const queryBuilder =
      this.orderRepository
        .getRepository()
        .createQueryBuilder('order')
        .leftJoinAndSelect(
          'order.user',
          'user',
        )
        .leftJoinAndSelect(
          'order.payment',
          'payment',
        )
        .leftJoinAndSelect(
          'order.orderDetails',
          'orderDetail',
        )
        .leftJoinAndSelect(
          'orderDetail.product',
          'product',
        )
        .leftJoinAndSelect(
          'product.productImages',
          'productImage',
        );

    if (filter?.length) {
      for (const expression of filter) {
        const separator =
          expression.includes('>=') ||
          expression.includes('<=') ||
          expression.includes('!')
            ? expression.includes('>=')
              ? '>='
              : expression.includes('<=')
                ? '<='
                : '!'
            : expression.includes('~')
              ? '~'
              : expression.includes(':')
                ? ':'
                : null;

        if (!separator) {
          continue;
        }

        const index =
          expression.indexOf(separator);

        const key =
          expression
            .substring(0, index)
            .trim();

        const value =
          expression
            .substring(
              index + separator.length,
            )
            .trim();

        const parameter =
          `filter_${Math.random()
            .toString(36)
            .slice(2, 10)}`;

        const column =
          `order.${key}`;

        switch (separator) {
          case ':':
            queryBuilder.andWhere(
              `${column} = :${parameter}`,
              {
                [parameter]: value,
              },
            );
            break;

          case '!':
            queryBuilder.andWhere(
              `${column} != :${parameter}`,
              {
                [parameter]: value,
              },
            );
            break;

          case '>=':
            queryBuilder.andWhere(
              `${column} >= :${parameter}`,
              {
                [parameter]: value,
              },
            );
            break;

          case '<=':
            queryBuilder.andWhere(
              `${column} <= :${parameter}`,
              {
                [parameter]: value,
              },
            );
            break;

          case '~':
            queryBuilder.andWhere(
              `${column} LIKE :${parameter}`,
              {
                [parameter]: `%${value}%`,
              },
            );
            break;
        }
      }
    }

    queryBuilder
      .orderBy(
        'order.createdDate',
        'DESC',
      )
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [orders, total] =
      await queryBuilder.getManyAndCount();

    return this.buildPaginationResponse(
      this.orderMapper.toDtoList(orders),
      page,
      pageSize,
      total,
    );
  }

  private buildPaginationResponse(
    data: OrderDto[],
    page: number,
    pageSize: number,
    total: number,
  ): ResultPaginationDto {
    const result =
      new ResultPaginationDto();

    const meta =
      new Meta();

    meta.page = page;
    meta.pageSize = pageSize;
    meta.pages =
      pageSize > 0
        ? Math.ceil(total / pageSize)
        : 0;
    meta.total = total;

    result.meta = meta;
    result.result = data;

    return result;
  }
}

