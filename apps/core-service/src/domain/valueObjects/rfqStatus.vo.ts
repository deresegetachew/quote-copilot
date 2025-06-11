import { RFQStatus } from '@common';

export class RFQStatusVO {
  private constructor(private readonly value: RFQStatus) {}

  static of(status: string): RFQStatusVO {
    if (!Object.values(RFQStatus).includes(status as RFQStatus)) {
      throw new Error(`Invalid RFQ status: ${status}`);
    }
    return new RFQStatusVO(status as RFQStatus);
  }

  static initial(): RFQStatusVO {
    return new RFQStatusVO(RFQStatus.NEW);
  }

  getValue(): RFQStatus {
    return this.value;
  }

  canTransitionTo(target: string): boolean {
    const transitions: Record<RFQStatus, RFQStatus[]> = {
      [RFQStatus.NEW]: [RFQStatus.PROCESSING, RFQStatus.PROCESSING_FAILED],
      [RFQStatus.PROCESSING]: [
        RFQStatus.COMPLETED,
        RFQStatus.CANCELED,
        RFQStatus.PROCESSING_FAILED,
      ],
      [RFQStatus.PROCESSING_FAILED]: [RFQStatus.CANCELED, RFQStatus.PROCESSING],
      [RFQStatus.COMPLETED]: [],
      [RFQStatus.CANCELED]: [],
    };

    return transitions[this.value]?.includes(target as RFQStatus) ?? false;
  }

  toString() {
    return this.value;
  }
}
