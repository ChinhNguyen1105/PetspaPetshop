import { Entity, Column, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('users')
@Unique(['email'])
export class User extends BaseEntity {
  @Column()
  email: string;

  @Column()
  password: string; // Hash only

  @Column()
  fullName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: 'CUSTOMER' })
  role: string; // ADMIN, STAFF, CUSTOMER

  @Column({ default: 'ACTIVE' })
  status: string; // ACTIVE, SUSPENDED, TERMINATED

  @Column({ nullable: true })
  lastLogin: Date;
}
