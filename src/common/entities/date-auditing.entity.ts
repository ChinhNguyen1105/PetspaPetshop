import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class DateAuditing {
  @CreateDateColumn({
    name: 'created_date',
    nullable: false,
    update: false,
  })
  createdDate: Date;

  @UpdateDateColumn({
    name: 'last_modified_date',
    nullable: false,
  })
  lastModifiedDate: Date;
}
