import {
  Column,
} from 'typeorm';

import { DateAuditing } from './date-auditing.entity';

export abstract class UserDateAuditing extends DateAuditing {
  @Column({
    name: 'createdBy',
    nullable: true,
    update: false,
  })
  createdBy: string | null;

  @Column({
    name: 'lastModifiedBy',
    nullable: true,
  })
  lastModifiedBy: string | null;
}
