
import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';

import { FileController } from 'src/modules/files/controller/file.controller';

import { FileServiceImpl } from 'src/modules/files/service/file.service.impl';

import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

@Module({
  imports: [
    ConfigModule,
  ],

  controllers: [
    FileController,
  ],

  providers: [
    FileServiceImpl,
    {
      provide: PROVIDER_TOKEN.FILE_SERVICE,
      useExisting: FileServiceImpl,
    },
  ],

  exports: [
    FileServiceImpl,
    {
      provide: PROVIDER_TOKEN.FILE_SERVICE,
      useExisting: FileServiceImpl,
    },
  ],
})
export class FilesModule {}

