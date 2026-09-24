import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import { PaginationDto } from 'src/common/dto/pagination/pagination.dto';

export class ProductQueryDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    return Array.isArray(value) ? value : [value];
  })
  @IsString({ each: true })
  filter?: string[];
}
