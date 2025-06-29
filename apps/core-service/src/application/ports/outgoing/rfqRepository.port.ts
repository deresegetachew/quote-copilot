import { PaginatedData, PaginatedDataFilters } from '@common';
import { RFQAggregate } from '../../../domain/entities/RFQ.aggregate';

export type TSearchFields = {
  threadId: string;
  status: string;
  email: string;
  hasAttachments: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export abstract class RfqRepositoryPort {
  abstract findById(id: string): Promise<RFQAggregate | null>;
  abstract findByThreadId(threadId: string): Promise<RFQAggregate | null>;
  abstract save(entity: RFQAggregate): Promise<void>;

  abstract searchByFields(
    filters: PaginatedDataFilters<TSearchFields>,
  ): Promise<PaginatedData<RFQAggregate>>;
}
