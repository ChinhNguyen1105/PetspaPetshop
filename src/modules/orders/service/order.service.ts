import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';
import { ReqCreateOrderBuyNowDto } from 'src/modules/orders/dto/request/req-create-order-buy-now.dto';
import { ReqCreateOrderFromCartDto } from 'src/modules/orders/dto/request/req-create-order-from-cart.dto';
import { ReqOrderStatusDto } from 'src/modules/orders/dto/request/req-order-status.dto';
import { ReqUpdateOrderStatusDto } from 'src/modules/orders/dto/request/req-update-order-status.dto';
import { OrderDto } from 'src/modules/orders/dto/response/order.dto';

export interface OrderService {
  createOrderFromCart(
    req: ReqCreateOrderFromCartDto,
  ): Promise<OrderDto>;

  createOrderFromBuyNow(
    req: ReqCreateOrderBuyNowDto,
  ): Promise<OrderDto>;

  getMyOrders(
    status: ReqOrderStatusDto,
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto>;

  getOrderDetail(orderId: number): Promise<OrderDto>;

  cancelOrder(orderId: number): Promise<OrderDto>;

  updateOrderStatus(
    req: ReqUpdateOrderStatusDto,
  ): Promise<OrderDto>;

  getAllOrders(
    filter: string[],
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto>;
}
