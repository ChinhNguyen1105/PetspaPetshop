import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { PermissionModule } from 'src/modules/permissions/permission.module';

import { RoleController } from 'src/modules/roles/controller/role.controller';

import { Role } from 'src/modules/roles/entities/role.entity';

import { RoleMapper } from 'src/modules/roles/mapper/role.mapper';

import { RoleRepository } from 'src/modules/roles/repositories/role.repository';

import { RoleServiceImpl } from 'src/modules/roles/service/role.service.impl';

import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), PermissionModule],

  controllers: [RoleController],

  providers: [
    RoleRepository,
    RoleMapper,
    RoleServiceImpl,
    {
      provide: PROVIDER_TOKEN.ROLE_SERVICE,
      useExisting: RoleServiceImpl,
    },
  ],

  exports: [
    RoleRepository,
    RoleMapper,
    RoleServiceImpl,
    {
      provide: PROVIDER_TOKEN.ROLE_SERVICE,
      useExisting: RoleServiceImpl,
    },
  ],
})
export class RoleModule {}
