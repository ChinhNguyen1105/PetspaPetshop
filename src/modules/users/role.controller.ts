import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateRoleDto, CreatePermissionDto } from './dtos/user.dto';
import { ResponseDto } from '../../common/dtos/response.dto';

@Controller('roles')
export class RoleController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createRole(
    @Body() createRoleDto: CreateRoleDto,
  ): Promise<ResponseDto<any>> {
    const role = await this.userService.createRole(createRoleDto);
    return new ResponseDto('SUCCESS', 'Role created', {
      id: role.id,
      name: role.name,
      description: role.description,
    });
  }

  @Get()
  async getAllRoles(): Promise<ResponseDto<any>> {
    const roles = await this.userService.getAllRoles();
    return new ResponseDto('SUCCESS', 'Roles retrieved', {
      result: roles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        permissions: r.permissions,
      })),
    });
  }

  @Get(':id')
  async getRoleById(@Param('id') id: string): Promise<ResponseDto<any>> {
    const role = await this.userService.getRoleById(id);
    return new ResponseDto('SUCCESS', 'Role found', {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
  }

  @Post(':roleId/permissions/:permissionId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async assignPermissionToRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ): Promise<ResponseDto<any>> {
    const role = await this.userService.assignPermissionToRole(
      roleId,
      permissionId,
    );
    return new ResponseDto('SUCCESS', 'Permission assigned to role', {
      id: role.id,
      name: role.name,
      permissions: role.permissions,
    });
  }
}
