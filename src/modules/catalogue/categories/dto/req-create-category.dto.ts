import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

import { CategoryType } from 'src/common/constants/category-type.enum';
import { EnumValue } from 'src/common/validators/enum-value.decorator';

export class ReqCreateCategoryDto {
  @IsNotEmpty({
    message: 'Category name is required',
  })
  @IsString()
  name: string;

  @EnumValue(CategoryType)
  categoryType: string;
}
