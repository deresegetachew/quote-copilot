export type PaginatedData<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};
