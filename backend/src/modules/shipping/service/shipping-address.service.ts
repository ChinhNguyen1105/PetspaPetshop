import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';
import { ReqCreateShippingAddressDto } from 'src/modules/shipping/dto/request/req-create-shipping-address.dto';
import { ReqUpdateShippingAddressDto } from 'src/modules/shipping/dto/request/req-update-shipping-address.dto';
import { ShippingAddressDto } from 'src/modules/shipping/dto/response/shipping-address.dto';

export interface ShippingAddressService {
  createShippingAddress(
    req: ReqCreateShippingAddressDto,
  ): Promise<ShippingAddressDto>;

  updateShippingAddress(
    req: ReqUpdateShippingAddressDto,
  ): Promise<ShippingAddressDto>;

  deleteShippingAddress(
    addressId: number,
  ): Promise<CommonResponseDto>;

  getAllShippingAddress(): Promise<ShippingAddressDto[]>;

  setDefaultShippingAddress(
    addressId: number,
  ): Promise<CommonResponseDto>;
}
