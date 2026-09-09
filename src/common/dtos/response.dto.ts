export class ResponseDto<T> {
  status: 'SUCCESS' | 'ERROR';
  message: string;
  data?: T;
  success?: boolean; // For compatibility with frontend clients

  constructor(status: 'SUCCESS' | 'ERROR', message: string, data?: T) {
    this.status = status;
    this.message = message;
    this.data = data;
    // For frontend compatibility
    this.success = status === 'SUCCESS';
  }
}

export class ListResponseDto<T> {
  result: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
  };

  constructor(result: T[], page: number, pageSize: number, total: number) {
    this.result = result;
    this.meta = {
      page,
      pageSize,
      total,
      pages: Math.ceil(total / pageSize),
    };
  }
}

export class PaginationDto {
  page: number = 1;
  pageSize: number = 10;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  getSkip(): number {
    return (this.page - 1) * this.pageSize;
  }
}
