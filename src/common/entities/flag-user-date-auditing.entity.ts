import { Column } from 'typeorm';

import { UserDateAuditing } from 'src/common/entities/user-date-auditing.entity';

export abstract class FlagUserDateAuditing extends UserDateAuditing {
  @Column({
    name: 'delete_flag',
    nullable: false,
    default: false,
  })
  deleteFlag: boolean;

  @Column({
    name: 'active_flag',
    nullable: false,
    default: true,
  })
  activeFlag: boolean;
}
