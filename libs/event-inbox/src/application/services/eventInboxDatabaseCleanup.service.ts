import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventInboxRepositoryPort } from '../ports/eventInboxRepository.port';

@Injectable()
export class EventInboxDatabaseCleanupService {
  private readonly logger = new Logger(EventInboxDatabaseCleanupService.name);

  constructor(private readonly repository: EventInboxRepositoryPort) {}

  /**
   * Set up cleanup infrastructure (called during module initialization)
   */
  async enableAutomaticCleanup(): Promise<void> {
    try {
      this.logger.debug('Setting up cleanup infrastructure...');
      await this.repository.setupCleanupInfrastructure();
      this.logger.debug('Cleanup infrastructure setup completed');
    } catch (error) {
      this.logger.error('Failed to set up cleanup infrastructure', error);
      throw error;
    }
  }

  /**
   * Scheduled cleanup that runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async scheduledCleanup(): Promise<void> {
    try {
      this.logger.debug('Running scheduled cleanup...');
      const deletedCount = await this.runCleanup();

      if (deletedCount > 0) {
        this.logger.log(
          `Scheduled cleanup completed: ${deletedCount} records deleted`,
        );
      }
    } catch (error) {
      this.logger.error('Scheduled cleanup failed', error);
    }
  }

  /**
   * Check if automatic cleanup is enabled
   */
  async isAutomaticCleanupEnabled(): Promise<boolean> {
    return await this.repository.isCleanupAvailable();
  }

  /**
   * Run cleanup operation with infrastructure abstraction
   */
  private async runCleanup(): Promise<number> {
    try {
      return await this.repository.executeCleanup();
    } catch (error) {
      this.logger.error('Cleanup operation failed', error);
      throw error;
    }
  }

  /**
   * Manually run cleanup (useful for testing or immediate cleanup)
   */
  async runManualCleanup(): Promise<number> {
    try {
      const deletedCount = await this.runCleanup();
      this.logger.debug(
        `Manual cleanup completed: ${deletedCount} records deleted`,
      );
      return deletedCount;
    } catch (error) {
      this.logger.error('Manual cleanup failed', error);
      throw error;
    }
  }
}
