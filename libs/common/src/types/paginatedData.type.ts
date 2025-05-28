export type PaginatedData<T> = {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type PaginatedDataFilters<T> = {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 1 | -1;
  search: string;
  filters: Partial<T>;
};
