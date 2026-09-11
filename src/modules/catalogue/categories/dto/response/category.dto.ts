import { CategoryType } from 'src/common/constants/category-type.enum';

export class CategoryDto {
  id: number;
  name: string;
  categoryType: CategoryType;
  activeFlag: boolean;
  deleteFlag: boolean;
}
