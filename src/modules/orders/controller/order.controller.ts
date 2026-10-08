import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import { VsResponseUtil } from 'src/common/base/vs-response.util';
import { UrlConstant } from 'src/common/constants/url.constant';
import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

import { ReqCreateOrderFromCartDto } from 'src/modules/orders/dto/request/req-create-order-from-cart.dto';
import { ReqCreateOrderBuyNowDto } from 'src/modules/orders/dto/request/req-create-order-buy-now.dto';
import { OrderQueryDto } from 'src/modules/orders/dto/request/order-query.dto';
import { OrderMyOrdersQueryDto } from 'src/modules/orders/dto/request/order-my-orders-query.dto';
import { ReqOrderStatusDto } from 'src/modules/orders/dto/request/req-order-status.dto';
import { ReqUpdateOrderStatusDto } from 'src/modules/orders/dto/request/req-update-order-status.dto';

import type { OrderService } from 'src/modules/orders/service/order.service';

@RestApiV1()
@Controller()
export class OrderController {
  constructor(
    @Inject(PROVIDER_TOKEN.ORDER_SERVICE)
    private readonly orderService: OrderService,
  ) {}

  @Get(UrlConstant.Order.GET_ALL_ORDERS)
  async getAllOrders(@Query() query: OrderQueryDto) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.orderService.getAllOrders(query),
    );
  }

  @Get(UrlConstant.Order.GET_REVENUE)
  async getRevenue() {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.orderService.getRevenue(),
    );
  }

  @Post(UrlConstant.Order.CREATE_ORDER_FROM_CART)
  async createOrderFromCart(@Body() req: ReqCreateOrderFromCartDto) {
    const orderDto = await this.orderService.createOrderFromCart(req);

    return VsResponseUtil.successWithStatus(HttpStatus.OK, orderDto);
  }

  @Post(UrlConstant.Order.CREATE_ORDER_FROM_BUY_NOW)
  async createOrderFromBuyNow(@Body() req: ReqCreateOrderBuyNowDto) {
    const orderDto = await this.orderService.createOrderFromBuyNow(req);

    return VsResponseUtil.successWithStatus(HttpStatus.OK, orderDto);
  }

  @Patch(UrlConstant.Order.CANCEL_ORDER)
  async cancelOrder(@Param('id') id: number) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.orderService.cancelOrder(id),
    );
  }

  @Patch(UrlConstant.Order.UPDATE_ORDER_STATUS)
  async updateOrderStatus(@Body() req: ReqUpdateOrderStatusDto) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.orderService.updateOrderStatus(req),
    );
  }

  @Get(UrlConstant.Order.GET_MY_ORDERS)
  async getMyOrders(@Query() query: OrderMyOrdersQueryDto) {
    const orderStatus: ReqOrderStatusDto = {
      status: query.status ?? null,
    };

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.orderService.getMyOrders(
        orderStatus,
        query.page,
        query.pageSize,
      ),
    );
  }

  @Get(UrlConstant.Order.GET_ORDER_DETAIL)
  async getOrderDetail(@Param('id') id: number) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.orderService.getOrderDetail(id),
    );
  }
}
