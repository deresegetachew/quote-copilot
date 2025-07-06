import { RFQAggregate } from '../entities/RFQ.aggregate';

export class RFQAttachmentsParsingRequestedDomainEvt {
  constructor(
    public readonly threadId: string,
    public readonly rfqAggregate: RFQAggregate,
  ) {}
}
