import { Entity, Column, ManyToOne, ForeignKey } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Service } from './service.entity';

@Entity('service_images')
export class ServiceImage extends BaseEntity {
  @Column()
  url: string;

  @Column({ nullable: true })
  altText: string;

  @Column({ default: false })
  isMain: boolean;

  @Column()
  @ForeignKey(() => Service)
  serviceId: string;

  @ManyToOne(() => Service, (service) => service.images, {
    onDelete: 'CASCADE',
  })
  service: Service;
}
