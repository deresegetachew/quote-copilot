import { Module, OnModuleInit } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EventInboxMikroAdapterModule } from '../infrastructure/adapters/mikroOrmRepositoryAdapter/eventInboxMikroAdapter.module';
import { EventInboxInterceptor } from './interceptors/eventInboxInterceptor';
import { EventInboxDatabaseCleanupService } from './services/eventInboxDatabaseCleanup.service';

@Module({
  imports: [
    EventInboxMikroAdapterModule,
    ScheduleModule.forRoot(), // Enable scheduled tasks
  ],
  providers: [EventInboxInterceptor, EventInboxDatabaseCleanupService],
  exports: [EventInboxInterceptor, EventInboxDatabaseCleanupService],
})
export class EventInboxApplicationModule implements OnModuleInit {
  constructor(
    private readonly cleanupService: EventInboxDatabaseCleanupService,
  ) {}

  async onModuleInit() {
    try {
      console.log('EventInbox: Setting up database cleanup components...');
      await this.cleanupService.enableAutomaticCleanup();
      console.log(
        'EventInbox: Automatic cleanup enabled with in-app scheduler',
      );
    } catch (error) {
      console.error('EventInbox: Failed to set up cleanup components:', error);
      // Don't throw - let the application continue even if cleanup setup fails
    }
  }
}
