import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { BadRequestException } from 'src/common/exceptions/bad-request.exception';
import { ConflictException } from 'src/common/exceptions/conflict.exception';
import { RoleConstant } from 'src/common/constants/role.constant';

import { ReqLoginDto } from 'src/modules/auth/dto/request/req-login.dto';
import { ReqRegisterDto } from 'src/modules/auth/dto/request/req-register.dto';
import { LoginResultDto } from 'src/modules/auth/dto/response/login-result.dto';
import {
  ResLoginDto,
  UserLoginDto,
} from 'src/modules/auth/dto/response/res-login.dto';
import { ResponseCookieDto } from 'src/modules/auth/dto/response/response-cookie.dto';

import { JwtTokenProvider } from 'src/modules/auth/security/jwt-token-provider';
import { UserPrincipal } from 'src/modules/auth/security/user-principal';

import { AuthService } from 'src/modules/auth/service/auth.service';
import type { UserService } from 'src/modules/users/service/user.service';

import { UserRepository } from 'src/modules/users/repositories/user.repository';
import { RoleRepository } from 'src/modules/roles/repositories/role.repository';

import { UserDto } from 'src/modules/users/dto/response/user.dto';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class AuthServiceImpl implements AuthService {
  private readonly refreshExpiration: number;

  constructor(
    private readonly userService: UserService,
    private readonly jwtTokenProvider: JwtTokenProvider,
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly configService: ConfigService,
  ) {
    this.refreshExpiration =
      this.configService.getOrThrow<number>(
        'jwt.refresh.expiration_time',
      );
  }

  async login(
    req: ReqLoginDto,
    request: import('express').Request,
  ): Promise<LoginResultDto> {
    const user =
      await this.userService.getUserByEmail(req.email);

    const passwordMatches = await bcrypt.compare(
      req.password,
      user.password,
    );

    if (!passwordMatches) {
      throw new BadRequestException(
        'Tài khoản hoặc mật khẩu không chính xác',
      );
    }

    if (user.email === null) {
      throw new BadRequestException(
        'Email của tài khoản không hợp lệ',
      );
    }

    const userPrincipal =
      UserPrincipal.create(user);

    request.user = userPrincipal;

    const resLoginDto = new ResLoginDto();

    const userLoginDto = new UserLoginDto();
    userLoginDto.id = user.id;
    userLoginDto.email = user.email;
    userLoginDto.name = user.name;
    userLoginDto.role = user.role;

    resLoginDto.user = userLoginDto;

    const accessToken =
      this.jwtTokenProvider.generateToken(
        userPrincipal,
        false,
      );

    resLoginDto.accessToken = accessToken;

    const refreshToken =
      this.jwtTokenProvider.generateToken(
        userPrincipal,
        true,
      );

    await this.userService.updateUserToken(
      refreshToken,
      req.email,
    );

    const responseCookie = new ResponseCookieDto();

    responseCookie.name = 'refresh_token';
    responseCookie.value = refreshToken;
    responseCookie.maxAge = this.refreshExpiration;
    responseCookie.domain = null;
    responseCookie.path = '/';
    responseCookie.secure = true;
    responseCookie.httpOnly = true;
    responseCookie.partitioned = false;
    responseCookie.sameSite = null;

    const loginResult =
      new LoginResultDto();

    loginResult.resLoginDTO = resLoginDto;
    loginResult.responseCookie = responseCookie;

    return loginResult;
  }

  async getNewRefreshToken(
    refreshToken: string,
  ): Promise<ResLoginDto> {
    return null as unknown as ResLoginDto;
  }

  async register(
    reqRegister: ReqRegisterDto,
  ): Promise<UserDto> {
    const exists =
      await this.userRepository
        .existsByEmailAndDeleteFlagFalse(
          reqRegister.email,
        );

    if (exists) {
      throw new ConflictException(
        'Email already exists',
      );
    }

    if (
      reqRegister.password !==
      reqRegister.confirmPassword
    ) {
      throw new BadRequestException(
        'Password and confirm password do not match',
      );
    }

    const registerUser = new User();

    registerUser.name = reqRegister.name;
    registerUser.email = reqRegister.email;

    registerUser.password =
      await bcrypt.hash(
        reqRegister.password,
        10,
      );

    registerUser.role =
      (await this.roleRepository
        .findByNameAndDeleteFlagFalse(
          RoleConstant.USER,
        )) as User['role'];

    const savedUser =
      await this.userRepository
        .getRepository()
        .save(registerUser);

    const registerResponseDto =
      new UserDto();

    registerResponseDto.id =
      savedUser.id;
    registerResponseDto.dateOfBirth =
      savedUser.dateOfBirth;
    registerResponseDto.email =
      savedUser.email;
    registerResponseDto.gender =
      savedUser.gender;
    registerResponseDto.name =
      savedUser.name;
    registerResponseDto.avatarUrl =
      savedUser.avatarUrl;
    registerResponseDto.createdDate =
      savedUser.createdDate;
    registerResponseDto.lastModifiedDate =
      savedUser.lastModifiedDate;
    registerResponseDto.createdBy =
      savedUser.createdBy;
    registerResponseDto.lastModifiedBy =
      savedUser.lastModifiedBy;

    return registerResponseDto;
  }
}
