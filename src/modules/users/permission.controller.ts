import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreatePermissionDto } from './dtos/user.dto';
import { ResponseDto } from '../../common/dtos/response.dto';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPermission(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<ResponseDto<any>> {
    const permission =
      await this.userService.createPermission(createPermissionDto);
    return new ResponseDto('SUCCESS', 'Permission created', {
      id: permission.id,
      code: permission.code,
      name: permission.name,
      description: permission.description,
    });
  }

  @Get()
  async getAllPermissions(): Promise<ResponseDto<any>> {
    const permissions = await this.userService.getAllPermissions();
    return new ResponseDto('SUCCESS', 'Permissions retrieved', {
      result: permissions.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        description: p.description,
        isActive: p.isActive,
      })),
    });
  }
}
