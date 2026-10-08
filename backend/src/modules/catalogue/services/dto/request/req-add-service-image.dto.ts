import {
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class ReqAddServiceImageDto {
  @IsDefined({ message: 'Service ID is required' })
  serviceId: number;

  @IsNotEmpty({ message: 'Image URL is required' })
  @IsString()
  imageUrl: string;

  @IsOptional()
  isThumbnail: boolean = false;
}
