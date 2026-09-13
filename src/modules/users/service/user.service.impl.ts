import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { GenderEnum } from 'src/common/constants/gender.enum';
import { RoleConstant } from 'src/common/constants/role.constant';
import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';
import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';
import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';
import { ConflictException } from 'src/common/exceptions/conflict.exception';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { UnauthorizedException } from 'src/common/exceptions/unauthorized.exception';
import { FilterProcessor } from 'src/common/specification/filter-processor';
import { SpecificationBuilder } from 'src/common/specification/specification-builder';
import { ReqUserUpdateProfileDto } from 'src/modules/users/dto/request/req-user-update-profile.dto';
import { UserCreateDto } from 'src/modules/users/dto/request/user-create.dto';
import { UserUpdateDto } from 'src/modules/users/dto/request/user-update.dto';
import { UserDto } from 'src/modules/users/dto/response/user.dto';
import { Role } from 'src/modules/roles/entities/role.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { UserMapper } from 'src/modules/users/mapper/user.mapper';
import { RoleRepository } from 'src/modules/roles/repositories/role.repository';
import { UserRepository } from 'src/modules/users/repositories/user.repository';
import { SecurityUtil } from 'src/modules/auth/security/security.util';
import type { FileService } from 'src/modules/files/service/file.service';
import { UserService } from 'src/modules/users/service/user.service';
@Injectable({ scope: Scope.REQUEST })
export class UserServiceImpl implements UserService {
  private readonly logger = new Logger(UserServiceImpl.name);
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userMapper: UserMapper,
    private readonly roleRepository: RoleRepository,
    @Inject(PROVIDER_TOKEN.FILE_SERVICE)
    private readonly fileService: FileService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}
  private async checkExistedUserByEmail(email: string): Promise<void> {
    const exists =
      await this.userRepository.existsByEmailAndDeleteFlagFalse(email);
    if (exists) {
      throw new ConflictException('Email already exists');
    }
  }
  async getUserById(userId: string): Promise<UserDto> {
    const user = await this.userRepository.findByIdAndDeleteFlagFalse(userId);
    if (!user) {
      throw new NotFoundException(`User not found with id: ${userId}`);
    }
    return this.userMapper.toUserDto(user);
  }
  async createUser(userCreateDto: UserCreateDto): Promise<UserDto> {
    await this.checkExistedUserByEmail(userCreateDto.email);
    const createUser = this.userMapper.toUser(userCreateDto);
    let defaultRole: Role | null = null;
    if (
      userCreateDto.role !== null &&
      userCreateDto.role !== undefined &&
      userCreateDto.role.id !== undefined &&
      userCreateDto.role.id !== null
    ) {
      defaultRole = await this.roleRepository.findByIdAndDeleteFlagFalse(
        userCreateDto.role.id,
      );
      if (!defaultRole) {
        throw new NotFoundException(
          `Role not found with id: ${userCreateDto.role.id}`,
        );
      }
    } else {
      defaultRole = await this.roleRepository.findByNameAndDeleteFlagFalse(
        RoleConstant.USER,
      );
      if (!defaultRole) {
        defaultRole = new Role();
        defaultRole.name = RoleConstant.USER;
        defaultRole = await this.roleRepository
          .getRepository()
          .save(defaultRole);
      }
    }
    createUser.role = defaultRole;
    await this.userRepository.getRepository().save(createUser);
    return this.userMapper.toUserDto(createUser);
  }
  async updateUser(userUpdateDto: UserUpdateDto): Promise<UserDto> {
    const updateUser = await this.userRepository.findByIdAndDeleteFlagFalse(
      userUpdateDto.id,
    );
    if (!updateUser) {
      throw new NotFoundException(
        `User not found with id: ${userUpdateDto.id}`,
      );
    }
    if (
      userUpdateDto.role !== null &&
      userUpdateDto.role !== undefined &&
      userUpdateDto.role.id !== undefined &&
      userUpdateDto.role.id !== null
    ) {
      const role = await this.roleRepository
        .getRepository()
        .findOne({ where: { id: userUpdateDto.role.id } });
      if (!role) {
        throw new NotFoundException(
          `Role not found with id: ${userUpdateDto.role.id}`,
        );
      }
      updateUser.role = role;
    }
    updateUser.name = userUpdateDto.name;
    updateUser.dateOfBirth = userUpdateDto.dateOfBirth;
    updateUser.gender = userUpdateDto.gender as GenderEnum;
    updateUser.avatarUrl = userUpdateDto.avatarUrl;
    await this.userRepository.getRepository().save(updateUser);
    return this.userMapper.toUserDto(updateUser);
  }
  async deleteUser(id: string): Promise<CommonResponseDto> {
    const deleteUser = await this.userRepository
      .getRepository()
      .findOne({ where: { id } });
    if (!deleteUser) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }
    deleteUser.deleteFlag = true;
    await this.userRepository.getRepository().save(deleteUser);
    return { status: true, message: 'Delete user success' };
  }
  async getAllUser(
    filter: string[],
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto> {
    const specificationBuilder = new SpecificationBuilder<User>();
    FilterProcessor.process(specificationBuilder, filter);
    const queryBuilder = this.userRepository
      .getRepository()
      .createQueryBuilder('user')
      .where('user.deleteFlag = :deleteFlag', { deleteFlag: false })
      .skip((page - 1) * pageSize)
      .take(pageSize);
    specificationBuilder.apply(queryBuilder, 'user');
    const [users, total] = await queryBuilder.getManyAndCount();
    const result = this.userMapper.toUserDtos(users);
    return {
      meta: { page, pageSize, pages: Math.ceil(total / pageSize), total },
      result,
    };
  }
  async changeUserStatus(id: string): Promise<CommonResponseDto> {
    const updateUser = await this.userRepository
      .getRepository()
      .findOne({ where: { id } });
    if (!updateUser) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }
    updateUser.activeFlag = !updateUser.activeFlag;
    await this.userRepository.getRepository().save(updateUser);
    return { status: true, message: 'Change user status success' };
  }
  async getUserLogin(): Promise<User> {
    const id = SecurityUtil.getCurrentUserLogin(this.request);
    if (!id) {
      throw new UnauthorizedException('Login required');
    }
    const currentUser =
      await this.userRepository.findByIdAndDeleteFlagFalse(id);
    if (!currentUser) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }
    return currentUser;
  }
  async getUserByEmail(email: string): Promise<User> {
    const currentUser =
      await this.userRepository.findByEmailAndDeleteFlagFalse(email);
    if (!currentUser) {
      throw new NotFoundException(`User not found with email: ${email}`);
    }
    return currentUser;
  }
  async updateUserToken(token: string, email: string): Promise<void> {
    const currentUser = await this.getUserByEmail(email);
    currentUser.refreshToken = token;
    await this.userRepository.getRepository().save(currentUser);
  }
  async getUserWithRoleAndPermissions(id: string): Promise<User> {
    const user = await this.userRepository.findByIdWithFullInfor(id);
    if (!user) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }
    return user;
  }
  async addAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<CommonResponseDto> {
    const user = await this.userRepository
      .getRepository()
      .findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User not found with id: ${userId}`);
    }
    const uploadFileResultDto = await this.fileService.uploadFile(
      file,
      'avatars',
    );
    if (uploadFileResultDto) {
      user.avatarUrl = uploadFileResultDto.fileName;
      await this.userRepository.getRepository().save(user);
      return { status: true, message: 'Upload avatar success' };
    }
    return {
      status: false,
      message: 'Không có ảnh nào được thêm (file lỗi hoặc trống',
    };
  }
  async updateProfile(
    reqUserUpdateProfile: ReqUserUpdateProfileDto,
  ): Promise<UserDto> {
    const currentUser = await this.getUserLogin();
    currentUser.name = reqUserUpdateProfile.name;
    currentUser.dateOfBirth = reqUserUpdateProfile.dateOfBirth;
    currentUser.gender = reqUserUpdateProfile.gender as GenderEnum;
    await this.userRepository.getRepository().save(currentUser);
    return this.userMapper.toUserDto(currentUser);
  }
  async getUserProfile(): Promise<UserDto> {
    const currentUser = await this.getUserLogin();
    return this.userMapper.toUserDto(currentUser);
  }
}
