import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class UpdateRoleDto {
  @IsInt({ message: 'ID Role phải là số nguyên!' })
  @Min(1, { message: 'ID Role phải lớn hơn 0!' })
  id: number;

  @IsNotEmpty({ message: 'Tên Role không được để trống!' })
  @IsString()
  @Matches(/^ROLE_[A-Z_]+$/, {
    message:
      "Tên Role phải bắt đầu bằng 'ROLE_' và chỉ chứa chữ in hoa hoặc dấu gạch dưới (Ví dụ: ROLE_ADMIN, ROLE_MANAGER)",
  })
  name: string;

  @IsOptional()
  @IsString()
  description: string | null;

  @IsBoolean({ message: 'activeFlag phải là kiểu boolean!' })
  activeFlag: boolean;

  @IsArray({ message: 'permissions phải là một mảng!' })
  permissions: Array<{ id: number }>;
}
