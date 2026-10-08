import { Request } from 'express';

import { UserPrincipal } from 'src/modules/auth/security/user-principal';

export class SecurityUtil {
  private constructor() {
    throw new Error('Utility class');
  }

  static getCurrentUserLogin(request: Request): string | null {
    const principal = request.user;

    return SecurityUtil.extractPrincipal(principal);
  }

  private static extractPrincipal(
    principal: unknown,
  ): string | null {
    if (principal === null || principal === undefined) {
      return null;
    }

    if (principal instanceof UserPrincipal) {
      return principal.getId();
    }

    if (typeof principal === 'object') {
      const jwtPrincipal = principal as {
        sub?: unknown;
      };

      if (
        jwtPrincipal.sub !== null &&
        jwtPrincipal.sub !== undefined
      ) {
        return String(jwtPrincipal.sub);
      }
    }

    if (typeof principal === 'string') {
      return principal;
    }

    return null;
  }
}
