import { Inject, Injectable, Logger } from '@nestjs/common';

import { GenderEnum } from 'src/common/constants/gender.enum';
import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';
import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';
import { BadRequestException } from 'src/common/exceptions/bad-request.exception';
import { ForbiddenException } from 'src/common/exceptions/forbidden.exception';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { FilterProcessor } from 'src/common/specification/filter-processor';
import { SpecificationBuilder } from 'src/common/specification/specification-builder';

import { Pet } from 'src/modules/pets/entities/pet.entity';
import { PetMapper } from 'src/modules/pets/mapper/pet.mapper';
import { PetRepository } from 'src/modules/pets/repositories/pet.repository';
import { ReqCreatePetDto } from 'src/modules/pets/dto/request/req-create-pet.dto';
import { ReqUpdatePetDto } from 'src/modules/pets/dto/request/req-update-pet.dto';
import { PetDto } from 'src/modules/pets/dto/response/pet.dto';

import type { UserService } from 'src/modules/users/service/user.service';

import type { PetService } from 'src/modules/pets/service/pet.service';
import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';
@Injectable()
export class PetServiceImpl implements PetService {
  private readonly logger = new Logger(PetServiceImpl.name);

  constructor(
    private readonly petRepository: PetRepository,
    private readonly petMapper: PetMapper,
    @Inject(PROVIDER_TOKEN.USER_SERVICE)
    private readonly userService: UserService,
  ) {}

  private async checkExistPet(userId: string, petName: string): Promise<void> {
    const exists =
      await this.petRepository.existsByUserIdAndNameAndDeleteFlagFalse(
        userId,
        petName,
      );

    if (exists) {
      throw new BadRequestException(
        `[PET] Pet with name ${petName} already exists for this user.`,
      );
    }
  }

  async createPet(req: ReqCreatePetDto): Promise<PetDto> {
    this.logger.log('[PET] Thêm thú cưng mới cho user hiện tại');

    const currentUser = await this.userService.getUserLogin();

    await this.checkExistPet(currentUser.id, req.name);

    const pet = new Pet();

    pet.name = req.name;
    pet.specie = req.specie;
    pet.gender = req.gender as GenderEnum;
    pet.birthday = req.birthday;
    pet.weight = req.weight;
    pet.healthStatus = req.healthStatus;
    pet.user = currentUser;

    await this.petRepository.getRepository().save(pet);

    this.logger.log(
      `[PET] Thêm thú cưng thành công | User ID: ${currentUser.id}`,
    );

    return this.petMapper.toDto(pet);
  }

  async updatePet(req: ReqUpdatePetDto): Promise<PetDto> {
    this.logger.log(`[PET] Cập nhật thú cưng ID: ${req.id}`);

    const currentUser = await this.userService.getUserLogin();

    const pet = await this.getPetAndValidate(req.id, currentUser.id);

    pet.name = req.name;
    pet.specie = req.specie;
    pet.gender = req.gender as GenderEnum;
    pet.birthday = req.birthday;
    pet.weight = req.weight;
    pet.healthStatus = req.healthStatus;

    await this.petRepository.getRepository().save(pet);

    this.logger.log(`[PET] Cập nhật thành công thú cưng ID: ${req.id}`);

    return this.petMapper.toDto(pet);
  }

  async deletePet(id: number): Promise<CommonResponseDto> {
    this.logger.log(`[PET] Xóa thú cưng ID: ${id}`);

    const currentUser = await this.userService.getUserLogin();

    const pet = await this.getPetAndValidate(id, currentUser.id);

    pet.deleteFlag = true;

    await this.petRepository.getRepository().save(pet);

    this.logger.log(`[PET] Xóa thành công thú cưng ID: ${id}`);

    return {
      status: true,
      message: `Deleted pet: ${pet.name} successfully`,
    };
  }

  async deactivatePet(id: number): Promise<CommonResponseDto> {
    this.logger.log(`[PET] Khóa thú cưng ID: ${id}`);

    const pet = await this.getPetById(id);

    if (pet.activeFlag === false) {
      throw new BadRequestException(
        `[PET] Thú cưng ID: ${id} đã bị khóa trước đó`,
      );
    }

    pet.activeFlag = false;

    await this.petRepository.getRepository().save(pet);

    this.logger.log(`[PET] Khóa thành công thú cưng ID: ${id}`);

    return {
      status: true,
      message: `Lock pet: ${pet.name} successfully`,
    };
  }

  async activatePet(id: number): Promise<CommonResponseDto> {
    this.logger.log(`[PET] Kích hoạt thú cưng ID: ${id}`);

    const pet = await this.getPetById(id);

    if (pet.activeFlag === true) {
      throw new BadRequestException(
        `[PET] Thú cưng ID: ${id} đã được kích hoạt trước đó`,
      );
    }

    pet.activeFlag = true;

    await this.petRepository.getRepository().save(pet);

    this.logger.log(`[PET] Mở khóa thành công thú cưng ID: ${id}`);

    return {
      status: true,
      message: `Unlock pet: ${pet.name} successfully`,
    };
  }

  async getMyPets(): Promise<PetDto[]> {
    this.logger.log('[PET] Lấy danh sách thú cưng của user hiện tại');

    const currentUser = await this.userService.getUserLogin();

    const pets = await this.petRepository.findByUserIdAndDeleteFlagFalse(
      currentUser.id,
    );

    this.logger.log(
      `[PET] User ID: ${currentUser.id} | Số thú cưng: ${pets.length}`,
    );

    return this.petMapper.toDtoList(pets);
  }

  async getPetDetail(id: number): Promise<PetDto> {
    this.logger.log(`[PET] Lấy chi tiết thú cưng ID: ${id}`);

    const currentUser = await this.userService.getUserLogin();

    const pet = await this.getPetAndValidate(id, currentUser.id);

    this.logger.log(`[PET] Lấy chi tiết thành công thú cưng ID: ${id}`);

    return this.petMapper.toDto(pet);
  }

  async getAllPet(
    filter: string[],
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto> {
    const specificationBuilder = new SpecificationBuilder<Pet>();

    FilterProcessor.process(specificationBuilder, filter);

    const queryBuilder = this.petRepository
      .getRepository()
      .createQueryBuilder('pet')
      .leftJoinAndSelect('pet.user', 'user')
      .where('pet.deleteFlag = :deleteFlag', {
        deleteFlag: false,
      })
      .orderBy('pet.createdDate', 'DESC');

    specificationBuilder.apply(queryBuilder, 'pet');

    queryBuilder.skip((page - 1) * pageSize).take(pageSize);

    const [pets, total] = await queryBuilder.getManyAndCount();

    const result = this.petMapper.toDtoList(pets);

    return {
      result,
      meta: {
        page,
        pageSize,
        pages: Math.ceil(total / pageSize),
        total,
      },
    };
  }

  private async getPetAndValidate(
    petId: number,
    currentUserId: string,
  ): Promise<Pet> {
    const pet = await this.getPetById(petId);

    if (pet.user?.id !== currentUserId) {
      throw new ForbiddenException(
        '[PET] Bạn không có quyền thao tác thú cưng này',
      );
    }

    return pet;
  }

  private async getPetById(petId: number): Promise<Pet> {
    const pet = await this.petRepository.findByIdAndDeleteFlagFalse(petId);

    if (!pet) {
      this.logger.warn(`[NOT_FOUND] Không tìm thấy thú cưng ID: ${petId}`);

      throw new NotFoundException(`[PET] Không tìm thấy thú cưng ID: ${petId}`);
    }

    if (pet.deleteFlag === true) {
      throw new NotFoundException(`[PET] Thú cưng ID: ${petId} đã bị xóa`);
    }

    if (pet.activeFlag === false) {
      throw new BadRequestException(`[PET] Thú cưng ID: ${petId} đã bị khóa`);
    }

    return pet;
  }
}
