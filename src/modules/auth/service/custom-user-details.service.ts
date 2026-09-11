import { UserPrincipal } from 'src/modules/auth/security/user-principal';

export interface CustomUserDetailsService {
  loadUserByUsername(email: string): Promise<UserPrincipal>;

  loadUserById(id: string): Promise<UserPrincipal>;
}
