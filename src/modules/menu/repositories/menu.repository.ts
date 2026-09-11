import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Menu } from 'src/modules/menu/entities/menu.entity';

@Injectable()
export class MenuRepository {
  constructor(
    @InjectRepository(Menu)
    private readonly repository: Repository<Menu>,
  ) {}

  findByParentIsNullOrderBySortOrderAsc() {
    return this.repository
      .createQueryBuilder('menu')
      .where('menu.parentId IS NULL')
      .orderBy('menu.sortOrder', 'ASC')
      .getMany();
  }

  findByParentIdOrderBySortOrderAsc(parentId: number) {
    return this.repository
      .createQueryBuilder('menu')
      .where('menu.parentId = :parentId', { parentId })
      .orderBy('menu.sortOrder', 'ASC')
      .getMany();
  }

  findByActiveFlagTrueOrderBySortOrderAsc() {
    return this.repository
      .createQueryBuilder('menu')
      .where('menu.activeFlag = true')
      .orderBy('menu.sortOrder', 'ASC')
      .getMany();
  }

  getRepository(): Repository<Menu> {
    return this.repository;
  }
}
