import { AggregateRoot } from '@nestjs/cqrs';
import { ProcessingStatusVO } from '../valueObjects/processingStatus.vo';
import { MessageIdVO } from '../valueObjects/messageId.vo';
import { SourceVO } from '../valueObjects/source.vo';
import { HashVO } from '../valueObjects/hash.vo';
import { DateHelper } from '../../../../common/src';
import { InvalidStatusTransitionException } from '../exceptions/invalidStatusTransition.exception';

export class EventInboxAggregate extends AggregateRoot {
  constructor(
    private messageId: MessageIdVO,
    private source: SourceVO,
    private eventHash: HashVO,
    private status: ProcessingStatusVO,
    private processedAt: Date | null,
    private expiresAt: Date | null,
    private metadata?: Record<string, any>,
  ) {
    super();
  }

  static createNew(
    source: string,
    event: Record<string, any>,
    eventID?: string,
    ttlSeconds: number = 86400,
  ): EventInboxAggregate {
    const now = DateHelper.toUTCDateTime(DateHelper.getNowAsDate());

    const aggregate = new EventInboxAggregate(
      MessageIdVO.new(eventID),
      SourceVO.of(source),
      HashVO.fromObject(event),
      ProcessingStatusVO.initial(),
      null, // processedAt is null initially
      DateHelper.addSecondsToDate(now, ttlSeconds),
      {},
    );

    return aggregate;
  }

  static fromPrimitives(props: {
    messageId: string;
    status: string;
    eventHash: string;
    source: string;
    processedAt?: Date | null;
    expiresAt: Date | null;
    metadata?: Record<string, any>;
  }): EventInboxAggregate {
    return new EventInboxAggregate(
      MessageIdVO.of(props.messageId),
      SourceVO.of(props.source),
      HashVO.of(props.eventHash),
      ProcessingStatusVO.of(props.status),
      props.processedAt || null,
      props.expiresAt,
      props.metadata || {},
    );
  }

  markAsCompleted(): void {
    const completedStatus = ProcessingStatusVO.of('completed');

    if (!this.status.canTransitionTo(completedStatus)) {
      throw new InvalidStatusTransitionException(
        this.status.value,
        completedStatus.value,
      );
    }

    this.status = completedStatus;
  }

  markAsFailed(): void {
    const failedStatus = ProcessingStatusVO.of('failed');

    if (!this.status.canTransitionTo(failedStatus)) {
      throw new InvalidStatusTransitionException(
        this.status.value,
        failedStatus.value,
      );
    }

    this.status = failedStatus;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  // Getters

  getMessageId(): string {
    return this.messageId.value;
  }
  getSource(): string {
    return this.source.value;
  }
  getEventHash(): string {
    return this.eventHash.value;
  }
  getStatus(): string {
    return this.status.value;
  }
  getProcessedAt(): Date | null {
    return this.processedAt;
  }
  getExpiresAt(): Date {
    return this.expiresAt;
  }
  getMetadata(): Record<string, any> | undefined {
    return this.metadata;
  }
}
