export class ResultPaginationDto {
  meta: Meta;
  result: unknown;
}

export class Meta {
  page: number;
  pageSize: number;
  pages: number;
  total: number;
}
