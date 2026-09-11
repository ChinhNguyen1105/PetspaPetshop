import {
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { CustomUserDetailsServiceImpl } from 'src/modules/auth/service/custom-user-details.service.impl';
import { JwtTokenProvider } from 'src/modules/auth/security/jwt-token-provider';

@Injectable()
export class JwtPreFilter implements NestMiddleware {
  private readonly logger = new Logger(JwtPreFilter.name);

  constructor(
    private readonly customUserDetailsService: CustomUserDetailsServiceImpl,
    private readonly tokenProvider: JwtTokenProvider,
  ) {}

  async use(
    request: Request,
    _response: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const jwt = JwtPreFilter.getJwtFromRequest(request);

      if (jwt && this.tokenProvider.validateToken(jwt)) {
        const id = this.tokenProvider.extractSubjectFromJwt(jwt);

        const userDetails =
          await this.customUserDetailsService.loadUserById(id);

        request.user = userDetails;
      }
    } catch (error) {
      this.logger.error(
        'Could not set user authentication in security context',
        error instanceof Error ? error.stack : String(error),
      );
    }

    next();
  }

  static getJwtFromRequest(request: Request): string | null {
    const bearerToken = request.header('Authorization');

    if (
      bearerToken &&
      bearerToken.startsWith('Bearer ')
    ) {
      return bearerToken.substring(7);
    }

    return null;
  }
}
