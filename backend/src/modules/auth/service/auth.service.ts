import { LoginResultDto } from 'src/modules/auth/dto/response/login-result.dto';
import { ReqLoginDto } from 'src/modules/auth/dto/request/req-login.dto';
import { ReqRegisterDto } from 'src/modules/auth/dto/request/req-register.dto';
import { ResLoginDto } from 'src/modules/auth/dto/response/res-login.dto';
import { UserDto } from 'src/modules/users/dto/response/user.dto';

export interface AuthService {
  login(
    req: ReqLoginDto,
    request: import('express').Request,
  ): Promise<LoginResultDto>;

  getNewRefreshToken(
    refreshToken: string,
  ): Promise<ResLoginDto>;

  register(
    reqRegister: ReqRegisterDto,
  ): Promise<UserDto>;
}
