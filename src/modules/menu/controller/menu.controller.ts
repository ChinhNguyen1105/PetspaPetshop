import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import { VsResponseUtil } from 'src/common/base/vs-response.util';
import { UrlConstant } from 'src/common/constants/url.constant';

import { ReqForMenuDto } from 'src/modules/menu/dto/request/req-for-menu.dto';
import type { MenuService } from 'src/modules/menu/service/menu.service';

@RestApiV1()
@Controller()
export class MenuController {
  constructor(
    private readonly menuService: MenuService,
  ) {}

  @Post(UrlConstant.Menu.CREATE_MENU)
  async createMenu(
    @Body() req: ReqForMenuDto,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.CREATED,
      await this.menuService.createMenu(req),
    );
  }

  @Put(
    UrlConstant.Menu.UPDATE_MENU.replace(
      '{id}',
      ':id',
    ),
  )
  async updateMenu(
    @Param('id') id: number,
    @Body() req: ReqForMenuDto,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.menuService.updateMenu(req, id),
    );
  }

  @Delete(
    UrlConstant.Menu.DELETE_MENU.replace(
      '{id}',
      ':id',
    ),
  )
  async deleteMenu(
    @Param('id') id: number,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.NO_CONTENT,
      await this.menuService.deleteMenu(id),
    );
  }

  @Get(
    UrlConstant.Menu.GET_MENU.replace(
      '{id}',
      ':id',
    ),
  )
  async getMenu(
    @Param('id') id: number,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.menuService.getMenuById(id),
    );
  }

  @Get(UrlConstant.Menu.GET_MENUS_TREE)
  async getMenuTree() {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.menuService.getMenuTree(),
    );
  }

  @Get(UrlConstant.Menu.GET_ACTIVE_MENUS)
  async getActiveMenus() {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.menuService.getActiveMenus(),
    );
  }

  @Get(UrlConstant.Menu.GET_ALL_MENUS)
  async getAllMenus(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.menuService.getAllMenus(
        Number(page),
        Number(pageSize),
      ),
    );
  }
}
