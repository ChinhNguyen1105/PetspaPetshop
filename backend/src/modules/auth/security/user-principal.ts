
import { User } from 'src/modules/users/entities/user.entity';

export class UserPrincipal {
  private readonly id: string | null;
  private readonly email: string | null;
  private password: string | null;
  private readonly authorities: string[] | null;

  constructor(
    email: string | null,
    password: string | null,
    authorities: string[] | null,
  );

  constructor(
    id: string | null,
    email: string | null,
    password: string | null,
    authorities: string[] | null,
  );

  constructor(
    idOrEmail: string | null,
    emailOrPassword: string | null,
    passwordOrAuthorities: string | null | string[],
    authorities?: string[] | null,
  ) {
    if (authorities === undefined) {
      this.id = null;
      this.email = idOrEmail;
      this.password = emailOrPassword;
      this.authorities = Array.isArray(passwordOrAuthorities)
        ? [...passwordOrAuthorities]
        : null;
    } else {
      this.id = idOrEmail;
      this.email = emailOrPassword;
      this.password =
        typeof passwordOrAuthorities === 'string'
          ? passwordOrAuthorities
          : null;
      this.authorities = authorities
        ? [...authorities]
        : null;
    }
  }

  // SỬA: Nhận thêm permissionNames để đưa quyền vào authorities.
  static create(
    user: User,
    permissionNames: string[] = [],
  ): UserPrincipal {
    const authorities: string[] = [];

    // Giữ role hiện tại.
    if (user.role?.name) {
      authorities.push(user.role.name);
    }

    // SỬA: Thêm tên Permission vào authorities.
    authorities.push(
      ...permissionNames.filter(
        (permission) => !authorities.includes(permission),
      ),
    );

    return new UserPrincipal(
      user.id,
      user.email,
      user.password,
      authorities,
    );
  }

  getId(): string | null {
    return this.id;
  }

  getUsername(): string | null {
    return this.email;
  }

  getPassword(): string | null {
    return this.password;
  }

  getAuthorities(): string[] | null {
    return this.authorities
      ? [...this.authorities]
      : null;
  }

  isAccountNonExpired(): boolean {
    return true;
  }

  isAccountNonLocked(): boolean {
    return true;
  }

  isCredentialsNonExpired(): boolean {
    return true;
  }

  isEnabled(): boolean {
    return true;
  }

  equals(object: unknown): boolean {
    if (this === object) {
      return true;
    }

    if (!(object instanceof UserPrincipal)) {
      return false;
    }

    return this.id === object.id;
  }

  hashCode(): string {
    return this.id ?? '';
  }
}

