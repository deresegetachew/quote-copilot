import { PaginatedData } from '@common';
import { MessageThreadAggregate } from '../../../domain/entities/messageThread.aggregate';

export abstract class EmailMessageRepositoryPort {
  abstract findByThreadId(id: string): Promise<MessageThreadAggregate | null>;
  abstract save(entity: MessageThreadAggregate): Promise<void>;

  abstract searchByFields(
    filters: Partial<{
      subject: string;
      body: string;
      from: string;
      to: string;
      receivedAt: Date;
      status: string;
    }>,
  ): Promise<PaginatedData<MessageThreadAggregate>>;
}
