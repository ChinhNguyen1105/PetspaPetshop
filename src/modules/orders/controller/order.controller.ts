import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import { VsResponseUtil } from 'src/common/base/vs-response.util';
import { UrlConstant } from 'src/common/constants/url.constant';

import { ReqCreateOrderFromCartDto } from 'src/modules/orders/dto/request/req-create-order-from-cart.dto';
import { ReqCreateOrderBuyNowDto } from 'src/modules/orders/dto/request/req-create-order-buy-now.dto';
import { ReqOrderStatusDto } from 'src/modules/orders/dto/request/req-order-status.dto';
import { ReqUpdateOrderStatusDto } from 'src/modules/orders/dto/request/req-update-order-status.dto';

import type { OrderService } from 'src/modules/orders/service/order.service';

@RestApiV1()
@Controller()
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
  ) {}

  @Get(
    UrlConstant.Order.GET_ORDER_DETAIL.replace(
      '{id}',
      ':id',
    ),
  )
  async getOrderDetail(
    @Param('id') id: number,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.orderService.getOrderDetail(id),
    );
  }

  @Get(UrlConstant.Order.GET_ALL_ORDERS)
  async getAllOrders(
    @Query('filter') filter: string[] | undefined,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.orderService.getAllOrders(
        filter ?? [],
        Number(page),
        Number(pageSize),
      ),
    );
  }

  @Post(
    UrlConstant.Order.CREATE_ORDER_FROM_CART,
  )
  async createOrderFromCart(
    @Body() req: ReqCreateOrderFromCartDto,
  ) {
    const orderDto =
      await this.orderService.createOrderFromCart(
        req,
      );

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      orderDto,
    );
  }

  @Post(
    UrlConstant.Order.CREATE_ORDER_FROM_BUY_NOW,
  )
  async createOrderFromBuyNow(
    @Body() req: ReqCreateOrderBuyNowDto,
  ) {
    const orderDto =
      await this.orderService.createOrderFromBuyNow(
        req,
      );

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      orderDto,
    );
  }

  @Patch(
    UrlConstant.Order.CANCEL_ORDER.replace(
      '{id}',
      ':id',
    ),
  )
  async cancelOrder(
    @Param('id') id: number,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.orderService.cancelOrder(id),
    );
  }

  @Patch(
    UrlConstant.Order.UPDATE_ORDER_STATUS,
  )
  async updateOrderStatus(
    @Body() req: ReqUpdateOrderStatusDto,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.orderService.updateOrderStatus(
        req,
      ),
    );
  }

  @Get(UrlConstant.Order.GET_MY_ORDERS)
  async getMyOrders(
    @Query('status') status: string | undefined,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    const orderStatus: ReqOrderStatusDto = {
      status: status ?? null,
    };

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.orderService.getMyOrders(
        orderStatus,
        Number(page),
        Number(pageSize),
      ),
    );
  }
}
