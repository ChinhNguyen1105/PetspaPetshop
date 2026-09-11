import { ReqAddServiceImageDto } from 'src/modules/catalogue/services/dto/request/req-add-service-image.dto';
import { ServiceImageDto } from 'src/modules/catalogue/services/dto/response/service-image.dto';

export interface PetServiceImageService {
  addImage(req: ReqAddServiceImageDto): Promise<ServiceImageDto>;

  deleteImage(imageId: number): Promise<void>;

  getServiceImages(serviceId: number): Promise<ServiceImageDto[]>;

  setMainImage(imageId: number): Promise<void>;

  deleteAllServiceImages(serviceId: number): Promise<void>;
}
