import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  findByEmailAndDeleteFlagFalse(email: string) {
    return this.repository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .andWhere('user.deleteFlag = false')
      .getOne();
  }

  findByIdAndDeleteFlagFalse(id: string) {
    return this.repository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .andWhere('user.deleteFlag = false')
      .getOne();
  }

  existsByEmailAndDeleteFlagFalse(email: string) {
    return this.repository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .andWhere('user.deleteFlag = false')
      .getExists();
  }

  findByIdWithFullInfor(id: string) {
    return this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .where('user.id = :id', { id })
      .andWhere('user.deleteFlag = false')
      .getOne();
  }

  getRepository(): Repository<User> {
    return this.repository;
  }
}
