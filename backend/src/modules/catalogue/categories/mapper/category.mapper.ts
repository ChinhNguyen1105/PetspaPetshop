import { Injectable } from '@nestjs/common';

import { Category } from 'src/modules/catalogue/categories/entities/category.entity';
import { CategoryDto } from 'src/modules/catalogue/categories/dto/response/category.dto';

@Injectable()
export class CategoryMapper {
  toDto(category: Category): CategoryDto {
    return Object.assign(new CategoryDto(), category);
  }

  toDtoList(categories: Category[]): CategoryDto[] {
    return categories.map((category) => this.toDto(category));
  }
}
