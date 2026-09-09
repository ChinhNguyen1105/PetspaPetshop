import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserService } from './user.service';
import {
  UpdateUserProfileDto,
  CreateRoleDto,
  CreatePermissionDto,
} from './dtos/user.dto';
import { ResponseDto, ListResponseDto } from '../../common/dtos/response.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('current')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() req): Promise<ResponseDto<any>> {
    const user = await this.userService.getUserById(req.user.sub);
    return new ResponseDto('SUCCESS', 'User fetched', {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
    });
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req): Promise<ResponseDto<any>> {
    const user = await this.userService.getUserById(req.user.sub);
    return new ResponseDto('SUCCESS', 'Profile retrieved', {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    });
  }

  @Patch('update-profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Req() req,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<ResponseDto<any>> {
    const updatedUser = await this.userService.updateUserProfile(
      req.user.sub,
      updateUserProfileDto,
    );
    return new ResponseDto('SUCCESS', 'Profile updated', {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      phoneNumber: updatedUser.phoneNumber,
      avatar: updatedUser.avatar,
    });
  }

  @Get()
  async getAllUsers(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ): Promise<ListResponseDto<any>> {
    const { users, total } = await this.userService.getAllUsers(page, pageSize);
    return new ListResponseDto(
      users.map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
      })),
      page,
      pageSize,
      total,
    );
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<ResponseDto<any>> {
    const user = await this.userService.getUserById(id);
    return new ResponseDto('SUCCESS', 'User found', {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    });
  }
}
