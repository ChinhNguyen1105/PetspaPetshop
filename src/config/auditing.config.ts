import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { UserPrincipal } from 'src/modules/auth/security/user-principal';

@Injectable()
export class AuditingConfig {
  getCurrentAuditor(request: Request): string | null {
    const principal = request.user;

    if (
      principal === null ||
      principal === undefined ||
      !(principal instanceof UserPrincipal)
    ) {
      return null;
    }

    return principal.getId();
  }
}
