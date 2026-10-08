import { SortByInterface } from './sort-by-interface';

export enum SortByDataConstant {
  USER = 'USER',
  JOB = 'JOB',
}

export const SortByData: Record<SortByDataConstant, SortByInterface> = {
  [SortByDataConstant.USER]: {
    getSortBy(sortBy: string): string {
      switch (sortBy) {
        case 'name':
          return 'name';

        case 'email':
          return 'email';

        case 'address':
          return 'address';

        case 'lastModifiedDate':
          return 'lastModifiedDate';

        default:
          return 'createdDate';
      }
    },
  },

  [SortByDataConstant.JOB]: {
    getSortBy(sortBy: string): string {
      switch (sortBy) {
        case 'name':
          return 'name';

        case 'location':
          return 'location';

        case 'salary':
          return 'salary';

        case 'quantity':
          return 'quantity';

        case 'level':
          return 'level';

        case 'startDate':
          return 'startDate';

        case 'endDate':
          return 'endDate';

        case 'lastModifiedDate':
          return 'lastModifiedDate';

        default:
          return 'createdDate';
      }
    },
  },
};
