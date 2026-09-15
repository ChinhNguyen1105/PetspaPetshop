import {
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';

export class ReqUpdatePermissionDto {
  @IsInt()
  id: number;

  @IsNotEmpty({ message: 'Tên Permission không được để trống!' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'API Path không được để trống!' })
  @IsString()
  apiPath: string;

  @IsNotEmpty({ message: 'HTTP Method không được để trống!' })
  @IsString()
  @Matches(/^(GET|POST|PUT|DELETE|PATCH)$/, {
    message:
      'HTTP Method phải là một trong các giá trị: GET, POST, PUT, DELETE, PATCH',
  })
  method: string;

  @IsNotEmpty({ message: 'Module không được để trống!' })
  @IsString()
  module: string;
}
