import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Inject,
} from '@nestjs/common';

import { VsResponseUtil } from 'src/common/base/vs-response.util';
import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

import { Role } from 'src/modules/roles/entities/role.entity';
import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { UpdateRoleDto } from 'src/modules/roles/dto/request/update-role.dto';

import type { RoleService } from 'src/modules/roles/service/role.service';

@RestApiV1()
@Controller()
export class RoleController {
  constructor(
    @Inject(PROVIDER_TOKEN.ROLE_SERVICE)
    private readonly roleService: RoleService,
  ) {}

  @Post('/roles')
  async createRole(@Body() role: Role) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.CREATED,
      await this.roleService.createRole(role),
    );
  }

  @Put('/roles')
  async updateRole(@Body() dto: UpdateRoleDto) {
    const role = Object.assign(new Role(), {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      activeFlag: dto.activeFlag,
      permissions: Promise.resolve(
        (dto.permissions ?? []).map((permission) =>
          Object.assign(new Permission(), {
            id: permission.id,
          }),
        ),
      ),
    });

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.roleService.updateRole(role),
    );
  }

  @Get('/roles')
  async fetchAllRoles(
    @Query('filter') filter: string[] | undefined,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.roleService.fetchAllRole(
        filter ?? [],
        Number(page),
        Number(pageSize),
      ),
    );
  }

  @Get('/roles/:id')
  async getARole(@Param('id', ParseIntPipe) id: number) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.roleService.fetchARole(id),
    );
  }

  @Delete('/roles/:id')
  async deleteARole(@Param('id', ParseIntPipe) id: number) {
    await this.roleService.deleteRole(id);

    return VsResponseUtil.successWithStatus(HttpStatus.OK, null);
  }
}
