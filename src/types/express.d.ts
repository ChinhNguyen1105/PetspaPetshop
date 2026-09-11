import type { UserPrincipal } from 'src/modules/auth/security/user-principal';

declare global {
  namespace Express {
    interface Request {
      user?: UserPrincipal;
    }
  }
}

export {};
