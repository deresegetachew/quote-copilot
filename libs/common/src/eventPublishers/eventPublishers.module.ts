import { Module } from '@nestjs/common';
import { DomainEventsPublisher } from './domainEventPublisher';

@Module({
  providers: [DomainEventsPublisher],
  exports: [DomainEventsPublisher],
})
export class EventPublishersModule {}
