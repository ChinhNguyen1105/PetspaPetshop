import { IsOptional, IsString } from 'class-validator';

import { PaginationDto } from 'src/common/dto/pagination/pagination.dto';

export class OrderMyOrdersQueryDto {
  @IsOptional()
  @IsString()
  status?: string;
}
