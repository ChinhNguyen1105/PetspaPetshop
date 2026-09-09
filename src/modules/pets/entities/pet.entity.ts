import { Entity, Column, ManyToOne, ForeignKey } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('pets')
export class Pet extends BaseEntity {
  @Column()
  name: string;

  @Column()
  @ForeignKey(() => User)
  userId: string;

  @Column()
  species: string; // dog, cat, rabbit, etc.

  @Column({ nullable: true })
  breed: string;

  @Column({ type: 'date' })
  dateOfBirth: string;

  @Column({ nullable: true })
  weight: number; // in kg

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: 'ACTIVE' })
  status: string; // ACTIVE, ARCHIVED

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
}
