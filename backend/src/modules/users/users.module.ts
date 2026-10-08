
import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { FilesModule } from 'src/modules/files/files.module';

import { RoleModule } from 'src/modules/roles/role.module';

import { UserController } from './user.controller';

import { User } from 'src/modules/users/entities/user.entity';

import { UserMapper } from 'src/modules/users/mapper/user.mapper';

import { UserRepository } from 'src/modules/users/repositories/user.repository';

import { UserServiceImpl } from 'src/modules/users/service/user.service.impl';

import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RoleModule,
    FilesModule,
  ],

  controllers: [
    UserController,
  ],

  providers: [
    UserRepository,
    UserMapper,
    UserServiceImpl,
    {
      provide: PROVIDER_TOKEN.USER_SERVICE,
      useExisting: UserServiceImpl,
    },
  ],

  exports: [
    UserRepository,
    UserMapper,
    UserServiceImpl,
    {
      provide: PROVIDER_TOKEN.USER_SERVICE,
      useExisting: UserServiceImpl,
    },
  ],
})
export class UsersModule {}

