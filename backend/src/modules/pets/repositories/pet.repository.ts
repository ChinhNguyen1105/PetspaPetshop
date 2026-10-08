import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Pet } from 'src/modules/pets/entities/pet.entity';

@Injectable()
export class PetRepository {
  constructor(
    @InjectRepository(Pet)
    private readonly repository: Repository<Pet>,
  ) {}

  findByUserId(userId: string) {
    return this.repository
      .createQueryBuilder('pet')
      .leftJoinAndSelect('pet.user', 'user')
      .where('user.id = :userId', { userId })
      .getOne();
  }

  findByUserIdAndDeleteFlagFalse(userId: string) {
    return this.repository
      .createQueryBuilder('pet')
      .leftJoinAndSelect('pet.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('pet.deleteFlag = false')
      .getMany();
  }

  findByIdAndDeleteFlagFalse(id: number) {
    return this.repository
      .createQueryBuilder('pet')
      .where('pet.id = :id', { id })
      .andWhere('pet.deleteFlag = false')
      .getOne();
  }

  existsByUserIdAndNameAndDeleteFlagFalse(
    userId: string,
    petName: string,
  ) {
    return this.repository
      .createQueryBuilder('pet')
      .leftJoin('pet.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('pet.name = :petName', { petName })
      .andWhere('pet.deleteFlag = false')
      .getExists();
  }

  getRepository(): Repository<Pet> {
    return this.repository;
  }
}
