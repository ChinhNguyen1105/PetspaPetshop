
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

import { UsersModule } from 'src/modules/users/users.module';

import { PetController } from 'src/modules/pets/controller/pet.controller';

import { Pet } from 'src/modules/pets/entities/pet.entity';

import { PetMapper } from 'src/modules/pets/mapper/pet.mapper';

import { PetRepository } from 'src/modules/pets/repositories/pet.repository';

import { PetServiceImpl } from 'src/modules/pets/service/pet.service.impl';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pet,
    ]),
    UsersModule,
  ],

  controllers: [
    PetController,
  ],

  providers: [
    PetRepository,
    PetMapper,

    PetServiceImpl,

    {
      provide: PROVIDER_TOKEN.PET_SERVICE,
      useExisting: PetServiceImpl,
    },
  ],

  exports: [
    PetRepository,
    PetMapper,

    PetServiceImpl,

    {
      provide: PROVIDER_TOKEN.PET_SERVICE,
      useExisting: PetServiceImpl,
    },
  ],
})
export class PetsModule {}

