import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ServiceImage } from './service-image.entity';

@Entity('services')
export class Service extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  duration: number; // in minutes

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @OneToMany(() => ServiceImage, (image) => image.service)
  images: ServiceImage[];
}
