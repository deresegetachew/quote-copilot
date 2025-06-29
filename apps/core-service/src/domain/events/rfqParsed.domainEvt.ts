import { RFQAggregate } from '../entities/RFQ.aggregate';

export class RFQParsedDomainEvt {
  constructor(
    public readonly threadId: string,
    public readonly rfq: RFQAggregate,
  ) {}
}
