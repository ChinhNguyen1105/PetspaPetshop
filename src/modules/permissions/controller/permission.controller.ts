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

import { VsResponseUtil } from 'src/common/base/vs-response.util';
import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import { UrlConstant } from 'src/common/constants/url.constant';

import { Permission } from 'src/modules/permissions/entities/permission.entity';
import type { PermissionService } from 'src/modules/permissions/service/permission.service';

@RestApiV1()
@Controller()
export class PermissionController {
  constructor(
    private readonly permissionService: PermissionService,
  ) {}

  @Post(UrlConstant.Permission.CREATE_PERMISSION)
  async createPermission(
    @Body() permission: Permission,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.CREATED,
      await this.permissionService.createPermission(
        permission,
      ),
    );
  }

  @Put(UrlConstant.Permission.UPDATE_PERMISSION)
  async updatePermission(
    @Body() permission: Permission,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.permissionService.updatePermission(
        permission,
      ),
    );
  }

  @Get(UrlConstant.Permission.GET_ALL_PERMISSION)
  async getAllPermission(
    @Query('filter') filter: string[] | undefined,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.permissionService.fetchAllPermission(
        filter ?? [],
        Number(page),
        Number(pageSize),
      ),
    );
  }

  @Get(
    UrlConstant.Permission.GET_PERMISSION.replace(
      '{id}',
      ':id',
    ),
  )
  async getAPermission(
    @Param('id') id: number,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.permissionService.fetchAPermission(
        id,
      ),
    );
  }

  @Delete(
    UrlConstant.Permission.DELETE_PERMISSION.replace(
      '{id}',
      ':id',
    ),
  )
  async deleteAPermission(
    @Param('id') id: number,
  ) {
    await this.permissionService.deletePermission(id);

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      null,
    );
  }
}
