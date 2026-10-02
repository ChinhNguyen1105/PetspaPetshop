import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';
import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';

import { ServiceQueryDto } from 'src/modules/catalogue/services/dto/request/service-query.dto';
import { ReqCreateServiceDto } from 'src/modules/catalogue/services/dto/request/req-create-service.dto';
import { ReqUpdateServiceDto } from 'src/modules/catalogue/services/dto/request/req-update-service.dto';
import { ServiceDto } from 'src/modules/catalogue/services/dto/response/service.dto';

export interface PetServiceService {
  createService(
    req: ReqCreateServiceDto,
  ): Promise<ServiceDto>;

  updateService(
    req: ReqUpdateServiceDto,
  ): Promise<ServiceDto>;

  deleteService(id: number): Promise<CommonResponseDto>;

  getServiceById(id: number): Promise<ServiceDto>;

  getAllServices(
    query: ServiceQueryDto,
  ): Promise<ResultPaginationDto>;

  getTopServices(limit: number): Promise<ServiceDto[]>;

  getRecommendedServiceIds(
    serviceIds: number[],
  ): Promise<number[]>;
}
