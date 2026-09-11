import { ShippingAddress } from 'src/modules/shipping/entities/shipping-address.entity';
import { ShippingAddressDto } from 'src/modules/shipping/dto/response/shipping-address.dto';

export class ShippingAddressMapper {
  toDto(
    shippingAddress: ShippingAddress,
  ): ShippingAddressDto {
    const dto = new ShippingAddressDto();

    dto.id = shippingAddress.id;
    dto.fullName = shippingAddress.fullName;
    dto.phone = shippingAddress.phone;
    dto.province = shippingAddress.province;
    dto.district = shippingAddress.district;
    dto.ward = shippingAddress.ward;
    dto.addressDetail =
      shippingAddress.addressDetail;
    dto.isDefault =
      shippingAddress.isDefault;

    return dto;
  }

  toDtos(
    shippingAddresses: ShippingAddress[],
  ): ShippingAddressDto[] {
    return shippingAddresses.map(
      (shippingAddress) =>
        this.toDto(shippingAddress),
    );
  }

  buildFullAddress(
    shippingAddress: ShippingAddress,
  ): string {
    return [
      shippingAddress.addressDetail,
      shippingAddress.ward,
      shippingAddress.district,
      shippingAddress.province,
    ]
      .filter(
        (value) =>
          value !== null &&
          value !== undefined &&
          value.trim() !== '',
      )
      .join(', ');
  }
}
