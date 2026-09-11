import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class ReqLoginDto {
  @IsNotEmpty({
    message: 'email khong duoc de trong',
  })
  @IsString()
  email: string;

  @IsNotEmpty({
    message: 'password khong duoc de trong',
  })
  @IsString()
  password: string;
}
