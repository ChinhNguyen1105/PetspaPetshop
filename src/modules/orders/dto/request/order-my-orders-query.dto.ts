import { IsOptional, IsString } from 'class-validator';

import { PaginationDto } from 'src/common/dto/pagination/pagination.dto';

export class OrderMyOrdersQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  status?: string;
}
