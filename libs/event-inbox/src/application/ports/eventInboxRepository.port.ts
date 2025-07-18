import { EventInboxAggregate } from '../../domain/entities/eventInboxAggregate';

export abstract class EventInboxRepositoryPort {
  abstract findByMessageId(
    messageID: string,
  ): Promise<EventInboxAggregate | null>;
  abstract save(aggregate: EventInboxAggregate): Promise<void>;
  abstract delete(messageID: string): Promise<void>;
  abstract findByEventHash(
    eventHash: string,
  ): Promise<EventInboxAggregate | null>;

  // Cleanup operations
  abstract setupCleanupInfrastructure(): Promise<void>;
  abstract executeCleanup(): Promise<number>;
  abstract isCleanupAvailable(): Promise<boolean>;
}
