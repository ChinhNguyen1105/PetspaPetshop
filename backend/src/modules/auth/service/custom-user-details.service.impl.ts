
import { Injectable } from '@nestjs/common';

import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { UserPrincipal } from 'src/modules/auth/security/user-principal';
import { UserRepository } from 'src/modules/users/repositories/user.repository';
import { CustomUserDetailsService } from 'src/modules/auth/service/custom-user-details.service';

@Injectable()
export class CustomUserDetailsServiceImpl
  implements CustomUserDetailsService
{
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async loadUserByUsername(email: string): Promise<UserPrincipal> {
    const user =
      await this.userRepository.findByEmailAndDeleteFlagFalse(email);

    if (!user) {
      throw new NotFoundException(
        `User not found with email: ${email}`,
      );
    }

    // SỬA: Đưa permission name vào principal để dùng cho authorization.
    const permissions =
      user.role?.permissions
        ? await user.role.permissions
        : [];

    const permissionNames = permissions
      .map((permission) => permission.name)
      .filter((name): name is string => name !== null);

    return UserPrincipal.create(
      user,
      permissionNames,
    );
  }

  async loadUserById(id: string): Promise<UserPrincipal> {
    // SỬA: Dùng query đã có sẵn để load User + Role + Permissions.
    const user =
      await this.userRepository.findByIdWithFullInfor(id);

    if (!user) {
      throw new NotFoundException(
        `User not found with id: ${id}`,
      );
    }

    // SỬA: Lazy relation permissions là Promise nên phải await.
    const permissions =
      user.role?.permissions
        ? await user.role.permissions
        : [];

    // SỬA: Chuyển Permission entity thành danh sách tên quyền
    // để UserPrincipal giữ dữ liệu security đơn giản.
    const permissionNames = permissions
      .map((permission) => permission.name)
      .filter((name): name is string => name !== null);

    return UserPrincipal.create(
      user,
      permissionNames,
    );
  }
}

