import { Role } from 'src/modules/roles/entities/role.entity';

export class ResLoginDto {
  accessToken: string;
  user: UserLoginDto;
}

export class UserLoginDto {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}
