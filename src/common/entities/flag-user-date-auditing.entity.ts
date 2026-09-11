import {
  Column,
} from 'typeorm';

import { UserDateAuditing } from './user-date-auditing.entity';

export abstract class FlagUserDateAuditing extends UserDateAuditing {
  @Column({
    name: 'deleteFlag',
    nullable: false,
    default: false,
  })
  deleteFlag: boolean;

  @Column({
    name: 'activeFlag',
    nullable: false,
    default: true,
  })
  activeFlag: boolean;
}
