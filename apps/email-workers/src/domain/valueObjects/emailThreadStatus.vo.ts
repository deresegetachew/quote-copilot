export enum EmailThreadStatus {
  NEW = 'NEW', // New thread
  READY_FOR_PARSING = 'READY_FOR_PARSING', // Ready for LLM Parsing
  PARSING = 'PARSING', // LLM Parsing the thread
  PARSED = 'PARSED', // LLM parsed the thread

  // check inventory

  NEEDS_CLARIFICATION = 'NEEDS_CLARIFICATION', // Email thread needs clarification from the customer
  CLOSED = 'CLOSED', // Thread closed
  ESCALATED = 'ESCALATED', // Thread escalated to human
}

export class EmailThreadStatusVO {
  private constructor(private readonly value: EmailThreadStatus) {}

  static of(status: string): EmailThreadStatusVO {
    if (
      !Object.values(EmailThreadStatus).includes(status as EmailThreadStatus)
    ) {
      throw new Error(`Invalid Email thread status: ${status}`);
    }
    return new EmailThreadStatusVO(status as EmailThreadStatus);
  }

  static initial(): EmailThreadStatusVO {
    return new EmailThreadStatusVO(EmailThreadStatus.NEW);
  }

  getValue(): EmailThreadStatus {
    return this.value;
  }

  canTransitionTo(target: string): boolean {
    const transitions = {
      [EmailThreadStatus.NEW]: [EmailThreadStatus.READY_FOR_PARSING],
      [EmailThreadStatus.READY_FOR_PARSING]: [EmailThreadStatus.PARSED],
      [EmailThreadStatus.PARSED]: [
        EmailThreadStatus.NEEDS_CLARIFICATION,
        EmailThreadStatus.ESCALATED,
        EmailThreadStatus.CLOSED,
      ],
      [EmailThreadStatus.NEEDS_CLARIFICATION]: [
        EmailThreadStatus.CLOSED,
        EmailThreadStatus.ESCALATED,
        EmailThreadStatus.READY_FOR_PARSING,
      ],
      [EmailThreadStatus.ESCALATED]: [
        EmailThreadStatus.READY_FOR_PARSING,
        EmailThreadStatus.CLOSED,
      ],
      [EmailThreadStatus.CLOSED]: [],
    };

    return transitions[this.value]?.includes(target) ?? false;
  }

  toString() {
    return this.value;
  }
}
