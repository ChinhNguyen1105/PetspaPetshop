import { Column } from 'typeorm';
import { DateAuditing } from './date-auditing.entity';

export abstract class UserDateAuditing extends DateAuditing {
  @Column({
    name: 'createdBy',
    type: 'varchar', // Bắt buộc khai báo kiểu dữ liệu
    length: 255,
    nullable: true,
    update: false,
  })
  createdBy: string | null;

  @Column({
    name: 'lastModifiedBy',
    type: 'varchar', // Bắt buộc khai báo kiểu dữ liệu
    length: 255,
    nullable: true,
  })
  lastModifiedBy: string | null;
}
