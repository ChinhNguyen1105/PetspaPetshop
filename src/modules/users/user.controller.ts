import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import { VsResponseUtil } from 'src/common/base/vs-response.util';
import { UrlConstant } from 'src/common/constants/url.constant';
import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';

import { UserCreateDto } from 'src/modules/users/dto/request/user-create.dto';
import { UserUpdateDto } from 'src/modules/users/dto/request/user-update.dto';
import { ReqUserUpdateProfileDto } from 'src/modules/users/dto/request/req-user-update-profile.dto';
import { UserDto } from 'src/modules/users/dto/response/user.dto';

import type { UserService } from 'src/modules/users/service/user.service';

@RestApiV1()
@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Get(UrlConstant.User.GET_USER)
  async getUser(
    @Param('id') id: string,
  ) {
    const userDto: UserDto =
      await this.userService.getUserById(id);

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      userDto,
    );
  }

  @Post(UrlConstant.User.CREATE_USER)
  async createUser(
    @Body() userCreateDto: UserCreateDto,
  ) {
    const userDto: UserDto =
      await this.userService.createUser(
        userCreateDto,
      );

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      userDto,
    );
  }

  @Put(UrlConstant.User.UPDATE_USER)
  async updateUser(
    @Body() user: UserUpdateDto,
  ) {
    const userDto: UserDto =
      await this.userService.updateUser(user);

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      userDto,
    );
  }

  @Delete(UrlConstant.User.DELETE_USER)
  async deleteUser(
    @Param('id') id: string,
  ) {
    const dto: CommonResponseDto =
      await this.userService.deleteUser(id);

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      dto,
    );
  }

  @Get(UrlConstant.User.GET_USERS)
  async getAllUser(
    @Query('filter') filter: string[] = [],
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
  ) {
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      await this.userService.getAllUser(
        filter,
        Number(page),
        Number(pageSize),
      ),
    );
  }

  @Patch(UrlConstant.User.CHANGE_USER_STATUS)
  async changeUserStatus(
    @Param('id') id: string,
  ) {
    const dto: CommonResponseDto =
      await this.userService.changeUserStatus(id);

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      dto,
    );
  }

  @Post(UrlConstant.User.ADD_AVATAR)
  @UseInterceptors(FileInterceptor('file'))
  async addAvatar(
    @UploadedFile()
    file: Express.Multer.File,
    @Param('userId') userId: string,
  ) {
    const commonResponseDto: CommonResponseDto =
      await this.userService.addAvatar(
        userId,
        file,
      );

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      commonResponseDto,
    );
  }

  @Put(UrlConstant.User.UPDATE_PROFILE)
  async updateProfile(
    @Body()
    reqUserUpdateProfile: ReqUserUpdateProfileDto,
  ) {
    const userDto: UserDto =
      await this.userService.updateProfile(
        reqUserUpdateProfile,
      );

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      userDto,
    );
  }

  @Get(UrlConstant.User.GET_PROFILE)
  async getUserProfile() {
    const userDto: UserDto =
      await this.userService.getUserProfile();

    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      userDto,
    );
  }
}
