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

    return UserPrincipal.create(user);
  }

  async loadUserById(id: string): Promise<UserPrincipal> {
    const user = await this.userRepository
      .getRepository()
      .findOne({
        where: { id },
      });

    if (!user) {
      throw new NotFoundException(
        `User not found with id: ${id}`,
      );
    }

    return UserPrincipal.create(user);
  }
}
