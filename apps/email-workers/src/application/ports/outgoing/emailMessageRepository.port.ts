import { PaginatedData } from '@common';
import { EmailMessageAggregate } from '../../../domain/entities/emailMessage.aggregate';

export abstract class EmailMessageRepositoryPort {
  abstract findByThreadId(id: string): Promise<EmailMessageAggregate | null>;
  abstract save(entity: EmailMessageAggregate): Promise<void>;

  abstract searchByFields(
    filters: Partial<{
      subject: string;
      body: string;
      from: string;
      to: string;
      receivedAt: Date;
      status: string;
    }>,
  ): Promise<PaginatedData<EmailMessageAggregate>>;
}
