import { Column } from 'typeorm';

import { DateAuditing } from 'src/common/entities/date-auditing.entity';

export abstract class UserDateAuditing extends DateAuditing {
  @Column({
    name: 'created_by',
    type: 'varchar',
    length: 255,
    nullable: true,
    update: false,
  })
  createdBy: string | null;

  @Column({
    name: 'last_modified_by',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  lastModifiedBy: string | null;
}
