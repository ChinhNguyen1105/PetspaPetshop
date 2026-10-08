
import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from 'src/modules/users/users.module';
import { RoleModule } from 'src/modules/roles/role.module';

import { AuthController } from 'src/modules/auth/auth.controller';

import { AuthServiceImpl } from 'src/modules/auth/service/auth.service.impl';
import { CustomUserDetailsServiceImpl } from 'src/modules/auth/service/custom-user-details.service.impl';

import { JwtTokenProvider } from 'src/modules/auth/security/jwt-token-provider';

import { JwtStrategy } from 'src/modules/auth/strategies/jwt.strategy';

import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

@Module({
  imports: [
    UsersModule,
    RoleModule,
    JwtModule.register({}),
  ],

  controllers: [
    AuthController,
  ],

  providers: [
    AuthServiceImpl,
    CustomUserDetailsServiceImpl,
    JwtTokenProvider,

    // Đăng ký Passport JWT strategy với tên "jwt".
    JwtStrategy,

    {
      provide: PROVIDER_TOKEN.AUTH_SERVICE,
      useExisting: AuthServiceImpl,
    },

    {
      provide: PROVIDER_TOKEN.CUSTOM_USER_DETAILS_SERVICE,
      useExisting: CustomUserDetailsServiceImpl,
    },
  ],

  exports: [
    AuthServiceImpl,

    {
      provide: PROVIDER_TOKEN.AUTH_SERVICE,
      useExisting: AuthServiceImpl,
    },

    {
      provide: PROVIDER_TOKEN.CUSTOM_USER_DETAILS_SERVICE,
      useExisting: CustomUserDetailsServiceImpl,
    },
  ],
})
export class AuthModule {}

