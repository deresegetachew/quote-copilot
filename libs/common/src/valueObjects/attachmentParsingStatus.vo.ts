export enum AttachmentParsingStatus {
  PENDING_PARSING = 'PENDING_PARSING',
  PARSING = 'PARSING',
  PARSED = 'PARSED',
  PARSING_FAILED = 'PARSING_FAILED',
}

export class AttachmentParsingStatusVO {
  private constructor(private readonly value: AttachmentParsingStatus) {}

  static of(status: string): AttachmentParsingStatusVO {
    if (
      !Object.values(AttachmentParsingStatus).includes(
        status as AttachmentParsingStatus,
      )
    ) {
      throw new Error(`Invalid attachment parsing status: ${status}`);
    }
    return new AttachmentParsingStatusVO(status as AttachmentParsingStatus);
  }

  static initial(): AttachmentParsingStatusVO {
    return new AttachmentParsingStatusVO(
      AttachmentParsingStatus.PENDING_PARSING,
    );
  }

  static pendingParsing(): AttachmentParsingStatusVO {
    return new AttachmentParsingStatusVO(
      AttachmentParsingStatus.PENDING_PARSING,
    );
  }

  static parsing(): AttachmentParsingStatusVO {
    return new AttachmentParsingStatusVO(AttachmentParsingStatus.PARSING);
  }

  static parsed(): AttachmentParsingStatusVO {
    return new AttachmentParsingStatusVO(AttachmentParsingStatus.PARSED);
  }

  static parsingFailed(): AttachmentParsingStatusVO {
    return new AttachmentParsingStatusVO(
      AttachmentParsingStatus.PARSING_FAILED,
    );
  }

  getValue(): AttachmentParsingStatus {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: AttachmentParsingStatusVO): boolean {
    return this.value === other.getValue();
  }

  canTransitionTo(target: string): boolean {
    const transitions = {
      [AttachmentParsingStatus.PENDING_PARSING]: [
        AttachmentParsingStatus.PARSING,
        AttachmentParsingStatus.PARSING_FAILED,
      ],
      [AttachmentParsingStatus.PARSING]: [
        AttachmentParsingStatus.PARSED,
        AttachmentParsingStatus.PARSING_FAILED,
      ],
      [AttachmentParsingStatus.PARSED]: [],
      [AttachmentParsingStatus.PARSING_FAILED]: [],
    };

    return transitions[this.value].includes(
      AttachmentParsingStatusVO.of(target).getValue(),
    );
  }
}
