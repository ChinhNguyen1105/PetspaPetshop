import { AsyncLocalStorage } from 'node:async_hooks';

export interface AuditContextData {
  auditorId: string | null;
}

export const auditContext =
  new AsyncLocalStorage<AuditContextData>();
