import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PetService } from 'src/modules/catalogue/services/entities/pet-service.entity';

@Injectable()
export class PetServiceRepository {
  constructor(
    @InjectRepository(PetService)
    private readonly repository: Repository<PetService>,
  ) {}

  getRepository(): Repository<PetService> {
    return this.repository;
  }
}
