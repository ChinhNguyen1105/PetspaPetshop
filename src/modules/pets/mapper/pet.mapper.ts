import { Injectable } from '@nestjs/common';

import { Pet } from 'src/modules/pets/entities/pet.entity';
import { PetDto } from 'src/modules/pets/dto/response/pet.dto';

@Injectable()
export class PetMapper {
  toDto(pet: Pet): PetDto {
    const dto = Object.assign(new PetDto(), pet);

    dto.ownerId = pet.user?.id ?? null;

    return dto;
  }

  toDtoList(pets: Pet[]): PetDto[] {
    return pets.map((pet) => this.toDto(pet));
  }
}
