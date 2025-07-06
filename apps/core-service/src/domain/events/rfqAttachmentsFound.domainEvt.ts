import z from 'zod';
import { RFQAggregate } from '../entities/RFQ.aggregate';

/**
 * No need to for schema validation for domain events
 * since they are created and consumed within the same boundary
 */

export class RFQAttachmentsFoundDomainEvt {
  constructor(
    public readonly threadId: string,
    public readonly rfqAggregate: RFQAggregate,
  ) {}
}
