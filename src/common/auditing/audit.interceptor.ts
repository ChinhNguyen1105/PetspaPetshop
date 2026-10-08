import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

import { auditContext } from './audit-context';
import { AuditingConfig } from 'src/config/auditing.config';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditingConfig: AuditingConfig,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const request =
      context.switchToHttp().getRequest<Request>();

    const auditorId =
      this.auditingConfig.getCurrentAuditor(request);

    return new Observable((subscriber) => {
      auditContext.run(
        {
          auditorId,
        },
        () => {
          const subscription = next.handle().subscribe({
            next: (value) => subscriber.next(value),
            error: (error) => subscriber.error(error),
            complete: () => subscriber.complete(),
          });

          subscriber.add(subscription);
        },
      );
    });
  }
}
