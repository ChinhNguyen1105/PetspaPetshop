import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import { VsResponseUtil } from 'src/common/base/vs-response.util';
import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';
import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';
import { ReqLoginDto } from 'src/modules/auth/dto/request/req-login.dto';
import { ReqRegisterDto } from 'src/modules/auth/dto/request/req-register.dto';
import { ResponseCookieDto } from 'src/modules/auth/dto/response/response-cookie.dto';
import type { AuthService } from 'src/modules/auth/service/auth.service';
import type { UserService } from 'src/modules/users/service/user.service';
import { User } from 'src/modules/users/entities/user.entity';
@RestApiV1()
@Controller()
export class AuthController {
  constructor(
    @Inject(PROVIDER_TOKEN.USER_SERVICE)
    private readonly userService: UserService,
    @Inject(PROVIDER_TOKEN.AUTH_SERVICE)
    private readonly authService: AuthService,
  ) {}
  @Post('auth/login') async login(
    @Body() loginRequestDto: ReqLoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const loginResult = await this.authService.login(loginRequestDto, request);
    response.setHeader(
      'Set-Cookie',
      this.buildResponseCookie(loginResult.responseCookie),
    );
    return VsResponseUtil.successWithStatus(
      HttpStatus.OK,
      loginResult.resLoginDTO,
    );
  }
  @Post('auth/register') async register(@Body() register: ReqRegisterDto) {
    const responseDto = await this.authService.register(register);
    return VsResponseUtil.successWithStatus(HttpStatus.OK, responseDto);
  }
  @Post('auth/logout') async logout(
    @Res({ passthrough: true }) response: Response,
  ) {
    const currentUser: User | null = await this.userService.getUserLogin();
    if (currentUser !== null && currentUser.email !== null) {
      await this.userService.updateUserToken(null, currentUser.email);
    }
    const deleteSpringCookie = new ResponseCookieDto();
    deleteSpringCookie.name = 'refresh_token';
    deleteSpringCookie.value = null;
    deleteSpringCookie.maxAge = 0;
    deleteSpringCookie.domain = null;
    deleteSpringCookie.path = '/';
    deleteSpringCookie.secure = true;
    deleteSpringCookie.httpOnly = true;
    deleteSpringCookie.partitioned = false;
    deleteSpringCookie.sameSite = null;
    response.setHeader(
      'Set-Cookie',
      this.buildResponseCookie(deleteSpringCookie),
    );
    const responseDto: CommonResponseDto = {
      status: true,
      message: 'Logout successfully!',
    };
    return VsResponseUtil.successWithStatus(HttpStatus.OK, responseDto);
  }
  private buildResponseCookie(cookie: ResponseCookieDto): string {
    const parts: string[] = [];
    const value = cookie.value === null ? '' : cookie.value;
    parts.push(`${cookie.name}=${value}`);
    if (cookie.maxAge !== undefined) {
      parts.push(`Max-Age=${cookie.maxAge}`);
    }
    if (cookie.domain !== null) {
      parts.push(`Domain=${cookie.domain}`);
    }
    if (cookie.path !== null) {
      parts.push(`Path=${cookie.path}`);
    }
    if (cookie.secure) {
      parts.push('Secure');
    }
    if (cookie.httpOnly) {
      parts.push('HttpOnly');
    }
    if (cookie.partitioned) {
      parts.push('Partitioned');
    }
    if (cookie.sameSite !== null && cookie.sameSite.length > 0) {
      parts.push(`SameSite=${cookie.sameSite}`);
    }
    return parts.join('; ');
  }
}
