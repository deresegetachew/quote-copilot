import { EventBus } from '@nestjs/cqrs';
import { TAggregateRoot } from '../types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DomainEventsPublisher {
  constructor(private readonly eventBus: EventBus) {}

  public async publishAll(aggregates: TAggregateRoot[]): Promise<void> {
    for (const aggregate of aggregates) {
      const domainEvents = aggregate.pullDomainEvents();
      for (const event of domainEvents) {
        await this.eventBus.publish(event);
      }
    }
  }
}
