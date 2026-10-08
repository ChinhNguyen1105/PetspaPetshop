import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import { PaginationDto } from 'src/common/dto/pagination/pagination.dto';

export class ServiceQueryDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (Array.isArray(value)) {
      return value.flatMap((item) =>
        String(item)
          .split(',')
          .map((filter) => filter.trim())
          .filter((filter) => filter.length > 0),
      );
    }

    return String(value)
      .split(',')
      .map((filter) => filter.trim())
      .filter((filter) => filter.length > 0);
  })
  @IsString({ each: true })
  filter?: string[];
}
