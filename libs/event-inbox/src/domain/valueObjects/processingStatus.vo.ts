export enum StatusEnum {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class ProcessingStatusVO {
  private constructor(private readonly _value: StatusEnum) {}

  get value(): StatusEnum {
    return this._value;
  }

  static of(status: string): ProcessingStatusVO {
    if (!Object.values(StatusEnum).includes(status as StatusEnum)) {
      throw new Error(`Invalid ProcessingStatus: ${status}`);
    }
    return new ProcessingStatusVO(status as StatusEnum);
  }

  static initial(): ProcessingStatusVO {
    return new ProcessingStatusVO(StatusEnum.PROCESSING);
  }

  canTransitionTo(_status: ProcessingStatusVO): boolean {
    const transitions: Record<StatusEnum, StatusEnum[]> = {
      [StatusEnum.PROCESSING]: [StatusEnum.COMPLETED, StatusEnum.FAILED], // Can complete or fail
      [StatusEnum.COMPLETED]: [], // Final state
      [StatusEnum.FAILED]: [StatusEnum.PROCESSING], // Can retry
    };

    return transitions[this.value]?.includes(_status.value) ?? false;
  }

  equals(other: ProcessingStatusVO): boolean {
    return this.value === other.value;
  }
}
