import { ResLoginDto } from 'src/modules/auth/dto/response/res-login.dto';
import { ResponseCookieDto } from 'src/modules/auth/dto/response/response-cookie.dto';

export class LoginResultDto {
  resLoginDTO: ResLoginDto;

  responseCookie: ResponseCookieDto;
}
