import { Controller, Get, HttpStatus, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';

import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import { VsResponseUtil } from 'src/common/base/vs-response.util';
import { UrlConstant } from 'src/common/constants/url.constant';

import { VNPayService } from 'src/modules/payments/vnpay.service';

@RestApiV1()
@Controller()
export class VNPayController {
  constructor(private readonly vnPayService: VNPayService) {}

  @Post(UrlConstant.Payment.CREATE_PAYMENT)
  async createPayment(
    @Query('orderId') orderId: number,
    @Req() request: Request,
  ) {
    const paymentUrl = await this.vnPayService.createPaymentUrl(
      Number(orderId),
      request,
    );

    return VsResponseUtil.successWithStatus(HttpStatus.OK, paymentUrl);
  }

  @Get(UrlConstant.Payment.HANDLE_RETURN)
  @Post(UrlConstant.Payment.HANDLE_RETURN)
  async handleReturn(@Req() request: Request) {
    const result = await this.vnPayService.handleReturn(request);

    return VsResponseUtil.successWithStatus(HttpStatus.OK, result);
  }

  @Get(UrlConstant.Payment.GET_PAYMENT_STATUS)
  async getPaymentStatus(@Query('orderId') orderId: number) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.vnPayService.getPaymentStatus(Number(orderId)),
    );
  }
}
