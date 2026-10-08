
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PermissionController } from 'src/modules/permissions/controller/permission.controller';
import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { PermissionMapper } from 'src/modules/permissions/mapper/permission.mapper';
import { PermissionRepository } from 'src/modules/permissions/repositories/permission.repository';
import { PermissionServiceImpl } from 'src/modules/permissions/service/permission.service.impl';
import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission]),
  ],
  controllers: [
    PermissionController,
  ],
  providers: [
    PermissionRepository,
    PermissionMapper,
    PermissionServiceImpl,
    {
      provide: PROVIDER_TOKEN.PERMISSION_SERVICE,
      useExisting: PermissionServiceImpl,
    },
  ],
  exports: [
    PermissionRepository,
    PermissionMapper,
    {
      provide: PROVIDER_TOKEN.PERMISSION_SERVICE,
      useExisting: PermissionServiceImpl,
    },
  ],
})
export class PermissionModule {}

