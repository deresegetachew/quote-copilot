import { PaginatedData, PaginatedDataFilters } from '@common';
import { RFQEntity } from '../../../domain/entities/RFQ.entity';
import { RFQDocument } from '../../../infrastructure/database/mongo/schemas/rfq.schema';

export type TSearchFields = {
  threadId: string;
  status: string;
  email: string;
  hasAttachments: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export abstract class RfqRepositoryPort {
  abstract findById(id: string): Promise<RFQEntity | null>;
  abstract save(entity: RFQEntity): Promise<void>;

  abstract searchByFields(
    filters: PaginatedDataFilters<TSearchFields>,
  ): Promise<PaginatedData<RFQEntity>>;
}
