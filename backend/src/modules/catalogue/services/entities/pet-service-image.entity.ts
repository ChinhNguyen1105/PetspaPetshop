import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { DateAuditing } from '../../../../common/entities/date-auditing.entity';
import { PetService } from './pet-service.entity';

@Entity('tbl_pet_service_images')
export class PetServiceImage extends DateAuditing {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
  })
  id: number;

  @Column({
    name: 'image_url',
    type: 'varchar', // Khai báo rõ kiểu chuỗi
    length: 255,
    nullable: true,
  })
  imageUrl: string | null;

  @Column({
    name: 'is_main',
    type: 'boolean', // Khai báo rõ kiểu boolean
    nullable: true,
    default: false,
  })
  isThumbnail: boolean;

  @ManyToOne(() => PetService, (petService) => petService.serviceImages)
  @JoinColumn({
    name: 'service_id',
  })
  petService: PetService;
}
