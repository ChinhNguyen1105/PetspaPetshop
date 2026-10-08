import { Injectable } from '@nestjs/common';

import { User } from 'src/modules/users/entities/user.entity';
import { UserDto } from 'src/modules/users/dto/response/user.dto';
import { UserCreateDto } from 'src/modules/users/dto/request/user-create.dto';
import { ReqRegisterDto } from 'src/modules/auth/dto/request/req-register.dto';

@Injectable()
export class UserMapper {
  toUser(userCreateDto: UserCreateDto): User {
    const user = new User();

    user.email = userCreateDto.email;
    user.password = userCreateDto.password;
    user.name = userCreateDto.name;
    user.dateOfBirth = userCreateDto.dateOfBirth;
    user.gender = userCreateDto.gender as User['gender'];

    if (userCreateDto.role) {
      user.role = userCreateDto.role;
    }

    return user;
  }

  toUserDto(user: User): UserDto {
    const dto = new UserDto();

    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.dateOfBirth = user.dateOfBirth;
    dto.gender = user.gender;
    dto.avatarUrl = user.avatarUrl;
    dto.roleName = user.role?.name ?? null;

    dto.createdDate = user.createdDate;
    dto.lastModifiedDate = user.lastModifiedDate;
    dto.deleteFlag = user.deleteFlag;
    dto.activeFlag = user.activeFlag;
    dto.createdBy = user.createdBy;
    dto.lastModifiedBy = user.lastModifiedBy;

    return dto;
  }

  toUserDtos(users: User[]): UserDto[] {
    return users.map((user) => this.toUserDto(user));
  }

  toUserDtoRegister(register: ReqRegisterDto): UserDto {
    const dto = new UserDto();

    dto.name = register.name;
    dto.email = register.email;

    return dto;
  }
}
