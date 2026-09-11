import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { PetService } from '../../catalogue/services/entities/pet-service.entity';

@Entity('tbl_pet_service_reviews')
export class PetServiceReview {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
  })
  id: number;

  @ManyToOne(
    () => User,
    (user) => user.petServiceReviews,
  )
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @Column({
    name: 'rating',
    nullable: false,
  })
  rating: number;

  @Column({
    name: 'comment',
    type: 'text',
    nullable: true,
  })
  comment: string | null;

  @ManyToOne(
    () => PetService,
  )
  @JoinColumn({
    name: 'service_id',
  })
  petService: PetService;
}
