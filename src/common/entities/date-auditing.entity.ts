import {
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class DateAuditing {
  @CreateDateColumn({
    name: 'createdDate',
    nullable: false,
    update: false,
  })
  createdDate: Date;

  @UpdateDateColumn({
    name: 'lastModifiedDate',
    nullable: false,
  })
  lastModifiedDate: Date;
}
