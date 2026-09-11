import { Injectable } from '@nestjs/common';

import { Menu } from 'src/modules/menu/entities/menu.entity';
import { MenuDto } from 'src/modules/menu/dto/response/menu.dto';

@Injectable()
export class MenuMapper {
  toDto(menu: Menu): MenuDto {
    const dto = new MenuDto();

    dto.id = menu.id;
    dto.name = menu.name;
    dto.path = menu.path;
    dto.icon = menu.icon;
    dto.sortOrder = menu.sortOrder;

    dto.children = menu.children
      ? menu.children.map((child) => this.toDto(child))
      : [];

    dto.roles = menu.roles
      ? menu.roles
          .map((role) => role?.name ?? null)
          .filter((name): name is string => name !== null)
      : [];

    dto.createdDate = menu.createdDate;
    dto.lastModifiedDate = menu.lastModifiedDate;
    dto.deleteFlag = menu.deleteFlag;
    dto.createdBy = menu.createdBy;
    dto.lastModifiedBy = menu.lastModifiedBy;

    return dto;
  }

  toDtos(menus: Menu[]): MenuDto[] {
    return menus.map((menu) => this.toDto(menu));
  }
}
