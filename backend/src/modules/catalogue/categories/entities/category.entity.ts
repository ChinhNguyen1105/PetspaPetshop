import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { FlagUserDateAuditing } from '../../../../common/entities/flag-user-date-auditing.entity';
import { CategoryType } from '../../../../common/constants/category-type.enum';

import { Product } from '../../products/entities/product.entity';
import { PetService } from '../../services/entities/pet-service.entity';

@Entity('tbl_categories')
export class Category extends FlagUserDateAuditing {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
  })
  id: number;

  @Column({
    name: 'name',
    type: 'varchar', // Bổ sung type cho chuỗi
    length: 255,
    nullable: true,
  })
  name: string | null;

  @Column({
    name: 'category_type',
    type: 'enum',
    enum: CategoryType,
    nullable: true,
  })
  categoryType: CategoryType | null;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @OneToMany(() => PetService, (petService) => petService.category)
  petServices: PetService[];
}
