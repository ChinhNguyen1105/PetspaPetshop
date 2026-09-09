import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PetService } from './pet.service';
import { CreatePetDto, UpdatePetDto } from './dtos/pet.dto';
import { ResponseDto, ListResponseDto } from '../../common/dtos/response.dto';

@Controller('pets')
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPet(
    @Req() req,
    @Body() createPetDto: CreatePetDto,
  ): Promise<ResponseDto<any>> {
    const pet = await this.petService.createPet(req.user.sub, createPetDto);
    return new ResponseDto('SUCCESS', 'Pet created successfully', {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      dateOfBirth: pet.dateOfBirth,
      weight: pet.weight,
      color: pet.color,
      avatar: pet.avatar,
      status: pet.status,
    });
  }

  @Get('my-pets')
  @UseGuards(JwtAuthGuard)
  async getUserPets(
    @Req() req,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ): Promise<ListResponseDto<any>> {
    const { pets, total } = await this.petService.getUserPets(
      req.user.sub,
      page,
      pageSize,
    );
    return new ListResponseDto(
      pets.map((p) => ({
        id: p.id,
        name: p.name,
        species: p.species,
        breed: p.breed,
        dateOfBirth: p.dateOfBirth,
        weight: p.weight,
        color: p.color,
        avatar: p.avatar,
        status: p.status,
      })),
      page,
      pageSize,
      total,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPetById(
    @Req() req,
    @Param('id') id: string,
  ): Promise<ResponseDto<any>> {
    const pet = await this.petService.getPetById(id, req.user.sub);
    return new ResponseDto('SUCCESS', 'Pet retrieved', {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      dateOfBirth: pet.dateOfBirth,
      weight: pet.weight,
      color: pet.color,
      avatar: pet.avatar,
      status: pet.status,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updatePet(
    @Req() req,
    @Param('id') id: string,
    @Body() updatePetDto: UpdatePetDto,
  ): Promise<ResponseDto<any>> {
    const pet = await this.petService.updatePet(id, req.user.sub, updatePetDto);
    return new ResponseDto('SUCCESS', 'Pet updated successfully', {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      dateOfBirth: pet.dateOfBirth,
      weight: pet.weight,
      color: pet.color,
      avatar: pet.avatar,
      status: pet.status,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deletePet(
    @Req() req,
    @Param('id') id: string,
  ): Promise<ResponseDto<null>> {
    await this.petService.deletePet(id, req.user.sub);
    return new ResponseDto('SUCCESS', 'Pet deleted successfully', null);
  }

  @Get('admin/pets')
  async getAllPets(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ): Promise<ListResponseDto<any>> {
    const { pets, total } = await this.petService.getUserPets(
      '',
      page,
      pageSize,
    );
    return new ListResponseDto(
      pets.map((p) => ({
        id: p.id,
        name: p.name,
        species: p.species,
        breed: p.breed,
      })),
      page,
      pageSize,
      total,
    );
  }
}
