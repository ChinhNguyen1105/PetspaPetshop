import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';
import { MenuController } from 'src/modules/menu/controller/menu.controller';
import { Menu } from 'src/modules/menu/entities/menu.entity';
import { MenuMapper } from 'src/modules/menu/mapper/menu.mapper';
import { MenuRepository } from 'src/modules/menu/repositories/menu.repository';
import { MenuServiceImpl } from 'src/modules/menu/service/menu.service.impl';
@Module({
  imports: [TypeOrmModule.forFeature([Menu])],
  controllers: [MenuController],
  providers: [
    MenuRepository,
    MenuMapper,
    MenuServiceImpl,
    { provide: PROVIDER_TOKEN.MENU_SERVICE, useExisting: MenuServiceImpl },
  ],
  exports: [
    MenuRepository,
    MenuMapper,
    MenuServiceImpl,
    { provide: PROVIDER_TOKEN.MENU_SERVICE, useExisting: MenuServiceImpl },
  ],
})
export class MenuModule {}
