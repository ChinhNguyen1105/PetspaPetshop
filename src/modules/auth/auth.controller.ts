import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dtos/auth.dto';
import { ResponseDto } from '../../common/dtos/response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<ResponseDto<any>> {
    try {
      const user = await this.authService.register(registerDto);
      return new ResponseDto('SUCCESS', 'Registration successful', {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<ResponseDto<any>> {
    try {
      const result = await this.authService.login(loginDto);
      return new ResponseDto('SUCCESS', 'Login successful', result);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(): Promise<ResponseDto<null>> {
    return new ResponseDto('SUCCESS', 'Logout successful', null);
  }
}
