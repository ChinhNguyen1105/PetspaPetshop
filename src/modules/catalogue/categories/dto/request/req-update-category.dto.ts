import {
  IsDefined,
  IsNotEmpty,
  IsString,
} from 'class-validator';

import { CategoryType } from 'src/common/constants/category-type.enum';
import { EnumValue } from 'src/common/validators/enum-value.decorator';

export class ReqUpdateCategoryDto {
  @IsDefined({ message: 'Category id is required' })
  id: number;

  @IsNotEmpty({ message: 'Category name is required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Category type is required' })
  @IsString()
  @EnumValue(CategoryType)
  categoryType: string;
}
