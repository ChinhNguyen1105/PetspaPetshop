import { Inject, Injectable, Logger } from '@nestjs/common';

import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';
import { ForbiddenException } from 'src/common/exceptions/forbidden.exception';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';

import { ReqCreateShippingAddressDto } from 'src/modules/shipping/dto/request/req-create-shipping-address.dto';
import { ReqUpdateShippingAddressDto } from 'src/modules/shipping/dto/request/req-update-shipping-address.dto';
import { ShippingAddressDto } from 'src/modules/shipping/dto/response/shipping-address.dto';
import { ShippingAddress } from 'src/modules/shipping/entities/shipping-address.entity';
import { ShippingAddressMapper } from 'src/modules/shipping/mapper/shipping-address.mapper';
import { ShippingAddressRepository } from 'src/modules/shipping/repositories/shipping-address.repository';
import { ShippingAddressService } from 'src/modules/shipping/service/shipping-address.service';
import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';
import type { UserService } from 'src/modules/users/service/user.service';

@Injectable()
export class ShippingAddressServiceImpl implements ShippingAddressService {
  private readonly logger = new Logger(ShippingAddressServiceImpl.name);

  constructor(
    private readonly shippingAddressRepository: ShippingAddressRepository,

    @Inject(PROVIDER_TOKEN.USER_SERVICE)
    private readonly userService: UserService,

    private readonly shippingAddressMapper: ShippingAddressMapper,
  ) {}

  async createShippingAddress(
    req: ReqCreateShippingAddressDto,
  ): Promise<ShippingAddressDto> {
    const currentUser = await this.userService.getUserLogin();

    const exists =
      await this.shippingAddressRepository.existsByUserIdAndFullNameAndPhoneAndProvinceAndDistrictAndWardAndAddressDetail(
        String(currentUser.id),
        req.fullName,
        req.phone,
        req.province,
        req.district,
        req.ward,
        req.addressDetail,
      );

    if (exists) {
      throw new ForbiddenException(
        'Địa chỉ đã tồn tại trong danh sách địa chỉ của bạn',
      );
    }

    const countAddress = await this.shippingAddressRepository.countByUserId(
      String(currentUser.id),
    );

    const shippingAddress = new ShippingAddress();

    shippingAddress.fullName = req.fullName;
    shippingAddress.phone = req.phone;
    shippingAddress.addressDetail = req.addressDetail;
    shippingAddress.ward = req.ward;
    shippingAddress.district = req.district;
    shippingAddress.province = req.province;
    shippingAddress.user = currentUser;

    if (countAddress === 0) {
      this.logger.log('[ADDRESS] Địa chỉ đầu tiên → auto set isDefault = true');

      shippingAddress.isDefault = true;
    } else if (req.isDefault === true) {
      this.logger.log(
        '[ADDRESS] Set địa chỉ mới làm default, bỏ default địa chỉ cũ',
      );

      const oldDefaultAddress =
        await this.shippingAddressRepository.findByUserIdAndIsDefaultTrue(
          String(currentUser.id),
        );

      if (oldDefaultAddress) {
        oldDefaultAddress.isDefault = false;

        await this.shippingAddressRepository
          .getRepository()
          .save(oldDefaultAddress);
      }

      shippingAddress.isDefault = true;
    } else {
      shippingAddress.isDefault = false;
    }

    const savedAddress = await this.shippingAddressRepository
      .getRepository()
      .save(shippingAddress);

    this.logger.log(
      `[ADDRESS] Thêm địa chỉ thành công | User ID: ${currentUser.id}`,
    );

    return this.shippingAddressMapper.toDto(savedAddress);
  }

  async updateShippingAddress(
    req: ReqUpdateShippingAddressDto,
  ): Promise<ShippingAddressDto> {
    const currentUser = await this.userService.getUserLogin();

    const shippingAddress = await this.shippingAddressRepository
      .getRepository()
      .findOne({
        where: {
          id: req.id,
        },
        relations: {
          user: true,
        },
      });

    if (!shippingAddress) {
      throw new NotFoundException(
        `Shipping address not found with id: ${req.id}`,
      );
    }

    if (String(currentUser.id) !== String(shippingAddress.user.id)) {
      throw new ForbiddenException(
        'You are not allowed to update this shipping address',
      );
    }

    if (req.isDefault === true && shippingAddress.isDefault !== true) {
      this.logger.log('[ADDRESS] Đổi default → bỏ default địa chỉ cũ');

      const oldDefaultAddress =
        await this.shippingAddressRepository.findByUserIdAndIsDefaultTrue(
          String(currentUser.id),
        );

      if (oldDefaultAddress) {
        oldDefaultAddress.isDefault = false;

        await this.shippingAddressRepository
          .getRepository()
          .save(oldDefaultAddress);
      }
    }

    shippingAddress.fullName = req.fullName;
    shippingAddress.phone = req.phone;
    shippingAddress.addressDetail = req.addressDetail;
    shippingAddress.ward = req.ward;
    shippingAddress.district = req.district;
    shippingAddress.province = req.province;
    shippingAddress.isDefault = req.isDefault;

    const updatedAddress = await this.shippingAddressRepository
      .getRepository()
      .save(shippingAddress);

    return this.shippingAddressMapper.toDto(updatedAddress);
  }

  async deleteShippingAddress(addressId: number): Promise<CommonResponseDto> {
    const shippingAddress = await this.shippingAddressRepository
      .getRepository()
      .findOne({
        where: {
          id: addressId,
        },
        relations: {
          user: true,
        },
      });

    if (!shippingAddress) {
      throw new NotFoundException(
        `Shipping address not found with id: ${addressId}`,
      );
    }

    const currentUser = await this.userService.getUserLogin();

    if (String(currentUser.id) !== String(shippingAddress.user.id)) {
      throw new ForbiddenException(
        'You are not allowed to delete this shipping address',
      );
    }

    if (shippingAddress.isDefault === true) {
      const addresses = await this.shippingAddressRepository.findByUserId(
        String(currentUser.id),
      );

      const newDefault = addresses.find(
        (address) => address.id !== shippingAddress.id,
      );

      if (newDefault) {
        newDefault.isDefault = true;

        await this.shippingAddressRepository.getRepository().save(newDefault);

        this.logger.log(
          `[ADDRESS] Set địa chỉ ID: ${newDefault.id} làm default mới`,
        );
      }
    }

    await this.shippingAddressRepository
      .getRepository()
      .remove(shippingAddress);

    return {
      status: true,
      message: 'Delete shipping address successfully',
    };
  }

  async getAllShippingAddress(): Promise<ShippingAddressDto[]> {
    const currentUser = await this.userService.getUserLogin();

    const addresses = await this.shippingAddressRepository.findByUserId(
      String(currentUser.id),
    );

    return addresses.map((address) =>
      this.shippingAddressMapper.toDto(address),
    );
  }

  async setDefaultShippingAddress(
    addressId: number,
  ): Promise<CommonResponseDto> {
    this.logger.log(`[ADDRESS] Đặt địa chỉ ID: ${addressId} làm mặc định`);

    const currentUser = await this.userService.getUserLogin();

    const address = await this.shippingAddressRepository
      .getRepository()
      .findOne({
        where: {
          id: addressId,
        },
        relations: {
          user: true,
        },
      });

    if (!address) {
      throw new NotFoundException(
        `Shipping address not found with id: ${addressId}`,
      );
    }

    if (address.isDefault === true) {
      this.logger.log(`[ADDRESS] Địa chỉ ID: ${addressId} đã là mặc định`);

      return {
        status: true,
        message: 'This address is already default',
      };
    }

    if (String(currentUser.id) === String(address.user.id)) {
      const oldDefaultAddress =
        await this.shippingAddressRepository.findByUserIdAndIsDefaultTrue(
          String(currentUser.id),
        );

      if (oldDefaultAddress) {
        oldDefaultAddress.isDefault = false;

        await this.shippingAddressRepository
          .getRepository()
          .save(oldDefaultAddress);

        this.logger.log(
          `[ADDRESS] Bỏ default địa chỉ ID: ${oldDefaultAddress.id}`,
        );
      }

      address.isDefault = true;

      await this.shippingAddressRepository.getRepository().save(address);

      this.logger.log(
        `[ADDRESS] Đặt thành công địa chỉ ID: ${addressId} làm mặc định`,
      );
    }

    return {
      status: true,
      message: `Set default address successfully, addressId: ${addressId}`,
    };
  }
}
