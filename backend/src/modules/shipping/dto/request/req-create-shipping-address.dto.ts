import {
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

import { ValidPhone } from 'src/common/validators/valid-phone.decorator';

export class ReqCreateShippingAddressDto {
  @IsNotEmpty({ message: 'Full name is required' })
  @IsString()
  @MaxLength(100, { message: 'Full name is too long' })
  fullName: string;

  @IsNotEmpty({ message: 'Phone is required' })
  @IsString()
  @ValidPhone()
  phone: string;

  @IsNotEmpty({ message: 'Address detail is required' })
  @IsString()
  addressDetail: string;

  @IsNotEmpty({ message: 'Ward is required' })
  @IsString()
  ward: string;

  @IsNotEmpty({ message: 'District is required' })
  @IsString()
  district: string;

  @IsNotEmpty({ message: 'Province is required' })
  @IsString()
  province: string;

  @IsDefined({ message: 'Is default is required' })
  @IsBoolean()
  isDefault: boolean = false;
}
