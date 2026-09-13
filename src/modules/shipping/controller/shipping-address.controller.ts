import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';

import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import { VsResponseUtil } from 'src/common/base/vs-response.util';

import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';
import { UrlConstant } from 'src/common/constants/url.constant';

import { ReqCreateShippingAddressDto } from 'src/modules/shipping/dto/request/req-create-shipping-address.dto';
import { ReqUpdateShippingAddressDto } from 'src/modules/shipping/dto/request/req-update-shipping-address.dto';

import type { ShippingAddressService } from 'src/modules/shipping/service/shipping-address.service';

@RestApiV1()
@Controller()
export class ShippingAddressController {
  constructor(
    @Inject(PROVIDER_TOKEN.SHIPPING_ADDRESS_SERVICE)
    private readonly service: ShippingAddressService,
  ) {}

  @Patch(UrlConstant.ShippingAddress.SET_DEFAULT_ADDRESS.replace('{id}', ':id'))
  async setDefaultShippingAddress(@Param('id') id: number) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.service.setDefaultShippingAddress(id),
    );
  }

  @Post(UrlConstant.ShippingAddress.CREATE_SHIPPING_ADDRESS)
  async createShippingAddress(@Body() req: ReqCreateShippingAddressDto) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.service.createShippingAddress(req),
    );
  }

  @Put(UrlConstant.ShippingAddress.UPDATE_SHIPPING_ADDRESS)
  async updateShippingAddress(@Body() req: ReqUpdateShippingAddressDto) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.service.updateShippingAddress(req),
    );
  }

  @Delete(
    UrlConstant.ShippingAddress.DELETE_SHIPPING_ADDRESS.replace('{id}', ':id'),
  )
  async deleteShippingAddress(@Param('id') id: number) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.service.deleteShippingAddress(id),
    );
  }

  @Get(UrlConstant.ShippingAddress.GET_SHIPPING_ADDRESSES)
  async getAllShippingAddress() {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.service.getAllShippingAddress(),
    );
  }
}
