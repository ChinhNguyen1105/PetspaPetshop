import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { UrlConstant } from 'src/common/constants/url.constant';
import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';
import { VsResponseUtil } from 'src/common/base/vs-response.util';
import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';

import { PermissionQueryDto } from 'src/modules/permissions/dto/request/permission-query.dto';
import { ReqPermissionDto } from 'src/modules/permissions/dto/request/req-permission.dto';
import { ReqUpdatePermissionDto } from 'src/modules/permissions/dto/request/req-update-permission.dto';
import type { PermissionService } from 'src/modules/permissions/service/permission.service';

@RestApiV1()
@Controller()
export class PermissionController {
  constructor(
    @Inject(PROVIDER_TOKEN.PERMISSION_SERVICE)
    private readonly permissionService: PermissionService,
  ) {}

  @Post(UrlConstant.Permission.CREATE_PERMISSION)
  async createPermission(
    @Body() permission: ReqPermissionDto,
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
    @Body() permission: ReqUpdatePermissionDto,
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
    @Query() query: PermissionQueryDto,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.permissionService.fetchAllPermission(
        query,
      ),
    );
  }

  @Get(
    UrlConstant.Permission.GET_PERMISSION
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
    UrlConstant.Permission.DELETE_PERMISSION
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
