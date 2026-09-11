import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { InvalidException } from 'src/common/exceptions/invalid.exception';
import { UserPrincipal } from 'src/modules/auth/security/user-principal';

export interface JwtAuthentication {
  principal: UserPrincipal;
  authorities: string[];
}

@Injectable()
export class JwtTokenProvider {
  private readonly CLAIM_TYPE = 'type';
  private readonly TYPE_ACCESS = 'access';
  private readonly TYPE_REFRESH = 'refresh';
  private readonly USERNAME_KEY = 'username';
  private readonly AUTHORITIES_KEY = 'auth';

  private readonly secretKey: string;
  private readonly expirationTimeAccessToken: number;
  private readonly expirationTimeRefreshToken: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.secretKey =
      this.configService.getOrThrow<string>('jwt.secret');

    this.expirationTimeAccessToken =
      this.configService.getOrThrow<number>(
        'jwt.access.expiration_time',
      );

    this.expirationTimeRefreshToken =
      this.configService.getOrThrow<number>(
        'jwt.refresh.expiration_time',
      );
  }

  generateToken(
    userPrincipal: UserPrincipal,
    isRefreshToken: boolean,
  ): string {
    const authorities =
      userPrincipal.getAuthorities() ?? [];

    const claims = {
      type: isRefreshToken
        ? this.TYPE_REFRESH
        : this.TYPE_ACCESS,
      username: userPrincipal.getUsername(),
      auth: authorities.join(','),
    };

    const expirationTime = isRefreshToken
      ? this.expirationTimeRefreshToken
      : this.expirationTimeAccessToken;

    return this.jwtService.sign(
      claims,
      {
        secret: this.secretKey,
        subject: userPrincipal.getId() ?? undefined,
        expiresIn: expirationTime,
      },
    );
  }

  getAuthenticationByRefreshToken(
    refreshToken: string,
  ): JwtAuthentication {
    try {
      const payload = this.jwtService.verify<{
        type?: string;
        username?: string;
        auth?: string;
      }>(refreshToken, {
        secret: this.secretKey,
      });

      if (
        payload.type !== this.TYPE_REFRESH ||
        !payload.auth ||
        !payload.username
      ) {
        throw new InvalidException(
          'Refresh token is invalid',
        );
      }

      const authorities = payload.auth
        .split(',')
        .filter((authority) => authority.length > 0);

      const principal = new UserPrincipal(
        payload.username,
        '',
        authorities,
      );

      return {
        principal,
        authorities,
      };
    } catch (error) {
      if (error instanceof InvalidException) {
        throw error;
      }

      throw new InvalidException(
        'Refresh token is invalid',
      );
    }
  }

  extractClaimUsername(token: string): string {
    const payload = this.verifyToken(token);

    const username = payload[this.USERNAME_KEY];

    if (
      username === null ||
      username === undefined
    ) {
      throw new InvalidException(
        'JWT username is missing',
      );
    }

    return String(username);
  }

  extractSubjectFromJwt(token: string): string {
    const payload = this.verifyToken(token);

    if (
      payload.sub === null ||
      payload.sub === undefined
    ) {
      throw new InvalidException(
        'JWT subject is missing',
      );
    }

    return String(payload.sub);
  }

  extractExpirationFromJwt(token: string): Date {
    const payload = this.verifyToken(token);

    if (
      payload.exp === null ||
      payload.exp === undefined
    ) {
      throw new InvalidException(
        'JWT expiration is missing',
      );
    }

    return new Date(Number(payload.exp) * 1000);
  }

  isTokenExpired(token: string): boolean {
    return this.extractExpirationFromJwt(token).getTime()
      < Date.now();
  }

  validateToken(token: string): boolean {
    try {
      this.jwtService.verify(token, {
        secret: this.secretKey,
      });

      return true;
    } catch {
      return false;
    }
  }

  private verifyToken(
    token: string,
  ): Record<string, any> {
    try {
      return this.jwtService.verify<
        Record<string, any>
      >(token, {
        secret: this.secretKey,
      });
    } catch {
      throw new InvalidException(
        'Invalid JWT token',
      );
    }
  }
}
