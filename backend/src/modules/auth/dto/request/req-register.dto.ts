import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class ReqRegisterDto {
  @IsNotEmpty({
    message: 'Name is required',
  })
  @IsString()
  name: string;

  @IsNotEmpty({
    message: 'Email is required',
  })
  @IsString()
  email: string;

  @IsNotEmpty({
    message: 'Password is required',
  })
  @IsString()
  password: string;

  @IsNotEmpty({
    message: 'Confirm password is required',
  })
  @IsString()
  confirmPassword: string;
}
