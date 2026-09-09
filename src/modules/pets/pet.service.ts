import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './entities/pet.entity';
import { CreatePetDto, UpdatePetDto } from './dtos/pet.dto';

@Injectable()
export class PetService {
  private readonly logger = new Logger(PetService.name);

  constructor(
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
  ) {}

  async createPet(userId: string, createPetDto: CreatePetDto): Promise<Pet> {
    const pet = this.petRepository.create({
      ...createPetDto,
      userId,
      status: 'ACTIVE',
    });

    const savedPet = await this.petRepository.save(pet);
    this.logger.log(`Pet created: ${savedPet.id} for user: ${userId}`);
    return savedPet;
  }

  async getPetById(petId: string, userId: string): Promise<Pet> {
    const pet = await this.petRepository.findOne({
      where: { id: petId, userId },
    });

    if (!pet) {
      throw new BadRequestException('Pet not found or does not belong to you');
    }

    return pet;
  }

  async getUserPets(userId: string, page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const [pets, total] = await this.petRepository.findAndCount({
      where: { userId, status: 'ACTIVE' },
      skip,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    return { pets, total };
  }

  async updatePet(
    petId: string,
    userId: string,
    updatePetDto: UpdatePetDto,
  ): Promise<Pet> {
    const pet = await this.getPetById(petId, userId);

    Object.assign(pet, updatePetDto);
    const updatedPet = await this.petRepository.save(pet);
    this.logger.log(`Pet updated: ${petId}`);
    return updatedPet;
  }

  async deletePet(petId: string, userId: string): Promise<void> {
    const pet = await this.getPetById(petId, userId);
    await this.petRepository.remove(pet);
    this.logger.log(`Pet deleted: ${petId}`);
  }

  async getPetsByIds(petIds: string[]): Promise<Pet[]> {
    return this.petRepository.findByIds(petIds);
  }
}
