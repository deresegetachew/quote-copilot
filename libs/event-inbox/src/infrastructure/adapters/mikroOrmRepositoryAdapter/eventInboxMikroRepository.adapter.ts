import { Injectable, Logger } from '@nestjs/common';
import { EventInboxRepositoryPort } from '../../../application/ports/eventInboxRepository.port';
import { EventInboxAggregate } from '../../../domain/entities/eventInboxAggregate';
import { EntityManager } from '@mikro-orm/core';
import { EventInbox } from '../../database/pg/schemas/eventInbox.schema';
import { EventInboxMapper } from '../../database/pg/mappers/eventInbox.mapper';
import { cleanupExpiredProcessedEvtsFn } from '../../database/pg/functions/cleanup.functions';

@Injectable()
export class EventInboxMikroOrmRepositoryAdapter extends EventInboxRepositoryPort {
  private readonly logger = new Logger(
    EventInboxMikroOrmRepositoryAdapter.name,
  );

  constructor(private readonly em: EntityManager) {
    super();
  }

  async findByMessageId(
    messageID: string,
  ): Promise<EventInboxAggregate | null> {
    const result = await this.em.findOne(EventInbox, { messageID });
    return result ? EventInboxMapper.toDomain(result) : null;
  }

  async save(aggregate: EventInboxAggregate): Promise<void> {
    const eventInbox = EventInboxMapper.toPersistence(aggregate);
    await this.em.persistAndFlush(eventInbox);
  }

  async delete(messageID: string): Promise<void> {
    const entity = await this.em.findOne(EventInbox, { messageID });
    if (entity) {
      await this.em.removeAndFlush(entity);
    }
  }

  async findByEventHash(
    eventHash: string,
  ): Promise<EventInboxAggregate | null> {
    const result = await this.em.findOne(EventInbox, { eventHash });
    return result ? EventInboxMapper.toDomain(result) : null;
  }

  // Cleanup operations
  async setupCleanupInfrastructure(): Promise<void> {
    try {
      this.logger.debug(
        'Setting up PostgreSQL cleanup functions and indexes...',
      );

      await this.em.getConnection().execute(cleanupExpiredProcessedEvtsFn);
      this.logger.debug('PostgreSQL cleanup components setup completed');
    } catch (error) {
      this.logger.error(
        'Failed to set up PostgreSQL cleanup components',
        error,
      );
      throw error;
    }
  }

  async executeCleanup(): Promise<number> {
    try {
      const result = await this.em
        .getConnection()
        .execute('SELECT cleanup_expired_processed_events() as deleted_count');

      return result[0]?.deleted_count || 0;
    } catch (error) {
      this.logger.error('Failed to execute cleanup function', error);
      throw error;
    }
  }

  async isCleanupAvailable(): Promise<boolean> {
    try {
      const result = await this.em.getConnection().execute(`
        SELECT EXISTS (
          SELECT 1 FROM pg_proc 
          WHERE proname = 'cleanup_expired_processed_events'
        ) as exists
      `);

      return result[0]?.exists || false;
    } catch (error) {
      this.logger.debug('Failed to check cleanup function availability', error);
      return false;
    }
  }
}
