import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';
import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';
import { ReqCreatePetDto } from 'src/modules/pets/dto/request/req-create-pet.dto';
import { ReqUpdatePetDto } from 'src/modules/pets/dto/request/req-update-pet.dto';
import { PetDto } from 'src/modules/pets/dto/response/pet.dto';

export interface PetService {
  createPet(req: ReqCreatePetDto): Promise<PetDto>;

  updatePet(req: ReqUpdatePetDto): Promise<PetDto>;

  deletePet(id: number): Promise<CommonResponseDto>;

  deactivatePet(id: number): Promise<CommonResponseDto>;

  activatePet(id: number): Promise<CommonResponseDto>;

  getMyPets(): Promise<PetDto[]>;

  getPetDetail(id: number): Promise<PetDto>;

  getAllPet(
    filter: string[],
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto>;
}
