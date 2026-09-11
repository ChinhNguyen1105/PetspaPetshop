import { Injectable } from '@nestjs/common';

import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';
import { Menu } from 'src/modules/menu/entities/menu.entity';
import { ReqForMenuDto } from 'src/modules/menu/dto/request/req-for-menu.dto';
import { MenuDto } from 'src/modules/menu/dto/response/menu.dto';
import { MenuMapper } from 'src/modules/menu/mapper/menu.mapper';
import { MenuRepository } from 'src/modules/menu/repositories/menu.repository';
import { MenuService } from 'src/modules/menu/service/menu.service';

@Injectable()
export class MenuServiceImpl implements MenuService {
  constructor(
    private readonly menuRepository: MenuRepository,
    private readonly menuMapper: MenuMapper,
  ) {}

  async createMenu(
    req: ReqForMenuDto,
  ): Promise<MenuDto> {
    const menu = new Menu();

    menu.name = req.name;
    menu.path = req.path;
    menu.icon = req.icon;

    if (req.parentId !== null) {
      menu.parent =
        await this.menuRepository
          .getRepository()
          .findOne({
            where: {
              id: req.parentId,
            },
          });
    } else {
      menu.parent = null;
    }

    const saved =
      await this.menuRepository
        .getRepository()
        .save(menu);

    const result =
      await this.menuRepository
        .getRepository()
        .findOne({
          where: { id: saved.id },
          relations: {
            children: true,
            roles: true,
          },
        });

    return this.menuMapper.toDto(result ?? saved);
  }

  async updateMenu(
    req: ReqForMenuDto,
    id: number,
  ): Promise<MenuDto> {
    const menu =
      await this.menuRepository
        .getRepository()
        .findOne({
          where: { id },
        });

    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    menu.name = req.name;
    menu.path = req.path;
    menu.icon = req.icon;

    if (req.parentId !== null) {
      menu.parent =
        await this.menuRepository
          .getRepository()
          .findOne({
            where: {
              id: req.parentId,
            },
          });
    } else {
      menu.parent = null;
    }

    const updated =
      await this.menuRepository
        .getRepository()
        .save(menu);

    const result =
      await this.menuRepository
        .getRepository()
        .findOne({
          where: { id: updated.id },
          relations: {
            children: true,
            roles: true,
          },
        });

    return this.menuMapper.toDto(result ?? updated);
  }

  async deleteMenu(
    id: number,
  ): Promise<CommonResponseDto> {
    const menu =
      await this.menuRepository
        .getRepository()
        .findOne({
          where: { id },
        });

    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    menu.deleteFlag = true;

    await this.menuRepository
      .getRepository()
      .save(menu);

    return {
      status: true,
      message: 'Menu deleted successfully',
    };
  }

  async getMenuById(
    id: number,
  ): Promise<MenuDto> {
    const menu =
      await this.menuRepository
        .getRepository()
        .findOne({
          where: { id },
          relations: {
            children: true,
            roles: true,
          },
        });

    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    return this.menuMapper.toDto(menu);
  }

  async getMenuTree(): Promise<MenuDto[]> {
    const menus =
      await this.menuRepository
        .getRepository()
        .createQueryBuilder('menu')
        .leftJoinAndSelect('menu.roles', 'role')
        .where('menu.deleteFlag = :deleteFlag', {
          deleteFlag: false,
        })
        .andWhere('menu.activeFlag = :activeFlag', {
          activeFlag: true,
        })
        .orderBy('menu.sortOrder', 'ASC')
        .getMany();

    const menuMap = new Map<number, Menu>();

    for (const menu of menus) {
      menu.children = [];
      menuMap.set(menu.id, menu);
    }

    const roots: Menu[] = [];

    for (const menu of menus) {
      if (menu.parent?.id) {
        const parent = menuMap.get(menu.parent.id);

        if (parent) {
          parent.children.push(menu);
        }
      } else {
        roots.push(menu);
      }
    }

    return this.menuMapper.toDtos(roots);
  }

  async getActiveMenus(): Promise<MenuDto[]> {
    const menus =
      await this.menuRepository
        .getRepository()
        .createQueryBuilder('menu')
        .leftJoinAndSelect('menu.roles', 'role')
        .where('menu.activeFlag = :activeFlag', {
          activeFlag: true,
        })
        .orderBy('menu.sortOrder', 'ASC')
        .getMany();

    return this.menuMapper.toDtos(menus);
  }

  async getAllMenus(
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto> {
    const queryBuilder =
      this.menuRepository
        .getRepository()
        .createQueryBuilder('menu')
        .where('menu.deleteFlag = :deleteFlag', {
          deleteFlag: false,
        });

    const [menus, total] =
      await queryBuilder
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getManyAndCount();

    const menuDtos =
      this.menuMapper.toDtos(menus);

    for (const menuDto of menuDtos) {
      menuDto.children = [];
    }

    const result = new ResultPaginationDto();

    result.meta = {
      page,
      pageSize,
      pages: Math.ceil(total / pageSize),
      total,
    };

    result.result = menuDtos;

    return result;
  }
}
