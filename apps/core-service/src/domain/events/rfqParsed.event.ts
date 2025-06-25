import { RFQAggregate } from '../entities/RFQ.aggregate';

export class RFQParsedEvent {
  constructor(
    public readonly threadId: string,
    public readonly rfq: RFQAggregate,
  ) {}
}
