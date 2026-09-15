
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserPrincipal } from 'src/modules/auth/security/user-principal';
import { CustomUserDetailsServiceImpl } from 'src/modules/auth/service/custom-user-details.service.impl';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  'jwt',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly customUserDetailsService: CustomUserDetailsServiceImpl,
  ) {
    super({
      // SỬA: Passport lấy JWT từ Authorization: Bearer <token>.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // SỬA: Dùng cùng JWT_SECRET với JwtTokenProvider.
      secretOrKey:
        configService.getOrThrow<string>('JWT_SECRET'),

      // SỬA: Không cần kiểm tra expiration thủ công;
      // passport-jwt sẽ từ chối token hết hạn.
      ignoreExpiration: false,
    });
  }

  async validate(
    payload: {
      sub?: string;
      username?: string;
      auth?: string;
      type?: string;
    },
  ): Promise<UserPrincipal> {
    // SỬA: sub chính là User.id được JwtTokenProvider đưa vào JWT.
    if (!payload.sub) {
      return null as unknown as UserPrincipal;
    }

    // SỬA: Load lại User + Role + Permissions từ database.
    return this.customUserDetailsService.loadUserById(
      payload.sub,
    );
  }
}

