import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ShippingAddress } from 'src/modules/shipping/entities/shipping-address.entity';

@Injectable()
export class ShippingAddressRepository {
  constructor(
    @InjectRepository(ShippingAddress)
    private readonly repository: Repository<ShippingAddress>,
  ) {}

  countByUserId(userId: string) {
    return this.repository
      .createQueryBuilder('address')
      .leftJoin('address.user', 'user')
      .where('user.id = :userId', { userId })
      .getCount();
  }

  findByUserIdAndIsDefaultTrue(userId: string) {
    return this.repository
      .createQueryBuilder('address')
      .leftJoinAndSelect('address.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('address.isDefault = true')
      .getOne();
  }

  findByUserId(userId: string) {
    return this.repository
      .createQueryBuilder('address')
      .leftJoinAndSelect('address.user', 'user')
      .where('user.id = :userId', { userId })
      .getMany();
  }

  existsByUserIdAndFullNameAndPhoneAndProvinceAndDistrictAndWardAndAddressDetail(
    userId: string,
    fullName: string,
    phone: string,
    province: string,
    district: string,
    ward: string,
    addressDetail: string,
  ) {
    return this.repository
      .createQueryBuilder('address')
      .leftJoin('address.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('address.fullName = :fullName', { fullName })
      .andWhere('address.phone = :phone', { phone })
      .andWhere('address.province = :province', { province })
      .andWhere('address.district = :district', { district })
      .andWhere('address.ward = :ward', { ward })
      .andWhere('address.addressDetail = :addressDetail', {
        addressDetail,
      })
      .getExists();
  }

  findById(id: number) {
    return this.repository.findOne({
      where: {
        id,
      },
      relations: ['user'],
    });
  }

  getRepository(): Repository<ShippingAddress> {
    return this.repository;
  }
}
