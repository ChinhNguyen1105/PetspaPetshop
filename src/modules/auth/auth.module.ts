import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthServiceImpl } from './service/auth.service.impl';
import { JwtTokenProvider } from 'src/modules/auth/security/jwt-token-provider';

import { User } from 'src/modules/users/entities/user.entity';
import { Role } from 'src/modules/roles/entities/role.entity';

import { UserRepository } from 'src/modules/users/repositories/user.repository';
import { RoleRepository } from 'src/modules/roles/repositories/role.repository';

// Import class thực thi của UserService để gán vào Inject Token
import { UserServiceImpl } from 'src/modules/users/service/user.service.impl';

@Module({
  imports: [
    // Khai báo các Entity để TypeORM tạo Repository gốc
    TypeOrmModule.forFeature([User, Role]),

    // Nạp ConfigModule để sử dụng được ConfigService trong constructor
    ConfigModule,

    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'PET_SPA_SECRET_KEY_12345',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: 'AUTH_SERVICE',
      useClass: AuthServiceImpl,
    },
    {
      provide: 'USER_SERVICE',
      useClass: UserServiceImpl,
    },
    // Khai báo các class provider còn lại mà constructor AuthServiceImpl cần
    JwtTokenProvider,
    UserRepository,
    RoleRepository,
  ],
  exports: ['AUTH_SERVICE'],
})
export class AuthModule {}

