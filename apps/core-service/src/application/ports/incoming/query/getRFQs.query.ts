export class GetRFQsQuery {
  constructor(
    public readonly page: number = 1,
    public readonly pageSize: number = 20,
    public readonly status?: string,
    public readonly search?: string,
  ) {}
} 