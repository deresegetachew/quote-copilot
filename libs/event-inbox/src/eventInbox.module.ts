import { Module } from '@nestjs/common';
import { EventInboxApplicationModule } from './application/eventInboxApplication.module';

@Module({
  imports: [EventInboxApplicationModule],
  exports: [EventInboxApplicationModule],
})
export class EventInboxModule {}
