import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';

@Entity()
@Index({ properties: ['source', 'messageID'], unique: true }) // Composite unique index for source and messageID
@Index({ properties: ['expiresAt', 'status'] }) // Composite index for expiresAt and status
@Index({ properties: ['eventHash'] }) // Index for eventHash
export class EventInbox {
  @PrimaryKey()
  messageID!: string;

  @Property()
  source!: string;

  @Property()
  eventHash!: string;

  @Property()
  status!: string;

  @Property({ nullable: true })
  processedAt?: Date | null;

  @Property({ nullable: true })
  expiresAt!: Date | null;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, any>;
}
