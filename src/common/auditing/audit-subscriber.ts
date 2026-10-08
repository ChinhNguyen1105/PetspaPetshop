import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';

import { auditContext } from 'src/common/auditing/audit-context';
import { UserDateAuditing } from 'src/common/entities/user-date-auditing.entity';

@EventSubscriber()
export class AuditSubscriber
  implements EntitySubscriberInterface<UserDateAuditing>
{
  listenTo(): typeof UserDateAuditing {
    return UserDateAuditing;
  }

  beforeInsert(
    event: InsertEvent<UserDateAuditing>,
  ): void {
    const entity = event.entity;

    if (!entity) {
      return;
    }

    const auditorId =
      auditContext.getStore()?.auditorId ?? null;

    entity.createdBy = auditorId;
    entity.lastModifiedBy = auditorId;
  }

  beforeUpdate(
    event: UpdateEvent<UserDateAuditing>,
  ): void {
    const entity = event.entity;

    if (!entity) {
      return;
    }

    const auditorId =
      auditContext.getStore()?.auditorId ?? null;

    entity.lastModifiedBy = auditorId;
  }
}
